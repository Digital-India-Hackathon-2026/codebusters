import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

def main():
    # Setup paths
    train_dir = os.path.join("dataset", "train")
    val_dir = os.path.join("dataset", "val")
    model_output_dir = "saved_models"
    model_output_path = os.path.join(model_output_dir, "xray_resnet18.pth")
    
    os.makedirs(model_output_dir, exist_ok=True)
    
    # Check if dataset directories exist
    if not (os.path.exists(train_dir) and os.path.exists(val_dir)):
        print("\n" + "="*80)
        print("WARNING: Dataset directories not found.")
        print(f"Please place your chest X-ray dataset in folders:")
        print(f"  {train_dir}/Normal, Pneumonia, Lung_Cancer")
        print(f"  {val_dir}/Normal, Pneumonia, Lung_Cancer")
        print("="*80 + "\n")
        
        print("Generating a default initialized ResNet18 model structure for development fallback...")
        try:
            # Fallback loader for older torchvision versions
            try:
                model = models.resnet18(weights=None)
            except TypeError:
                model = models.resnet18(pretrained=False)
            num_ftrs = model.fc.in_features
            model.fc = nn.Linear(num_ftrs, 3) # 3 classes: Normal, Pneumonia, Lung Cancer
            torch.save(model.state_dict(), model_output_path)
            print(f"Fallback model saved successfully to: {model_output_path}")
        except Exception as e:
            print(f"Failed to generate fallback model: {e}")
        return

    # Define transforms
    train_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Load dataset
    print("Loading chest X-ray dataset...")
    try:
        train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
        val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)
        
        train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
        
        class_names = train_dataset.classes
        print(f"Detected classes: {class_names}")
        if len(class_names) != 3:
            print(f"Warning: Expected 3 classes, found {len(class_names)}. Adapting model head...")
            
    except Exception as e:
        print(f"Error loading image folder dataset: {e}")
        return
        
    # Model configuration (transfer learning using ResNet18)
    print("Initializing ResNet18 Transfer Learning model...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    try:
        # Load weights=IMAGENET1K_V1 in newer torchvision, else fall back to pretrained=True
        try:
            model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        except AttributeError:
            model = models.resnet18(pretrained=True)
    except Exception as e:
        print(f"Could not load pre-trained weights ({e}). Initializing without pre-training...")
        try:
            model = models.resnet18(weights=None)
        except TypeError:
            model = models.resnet18(pretrained=False)
            
    # Freeze convolutional blocks
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace last layer
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=0.001)
    
    # Train loops (1 epoch for demo/development speed)
    epochs = 3
    print(f"Beginning model training on {device} for {epochs} epochs...")
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        corrects = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
            running_loss += loss.item() * inputs.size(0)
            corrects += torch.sum(preds == labels.data)
            
        epoch_loss = running_loss / len(train_dataset)
        epoch_acc = corrects.double() / len(train_dataset)
        
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")
        
    # Save trained weights
    torch.save(model.state_dict(), model_output_path)
    print(f"Model successfully trained and saved to: {model_output_path}")

if __name__ == '__main__':
    main()
