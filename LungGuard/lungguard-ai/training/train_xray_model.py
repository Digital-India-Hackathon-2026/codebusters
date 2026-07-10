"""
LungGuard AI — Chest X-ray Model Training Script
=================================================
Trains a ResNet18 transfer learning model on the chest_xray dataset.

Dataset structure:
  dataset/chest_xray/train/NORMAL/
  dataset/chest_xray/train/PNEUMONIA/
  dataset/chest_xray/test/NORMAL/
  dataset/chest_xray/test/PNEUMONIA/

Classes: Normal, Pneumonia

Usage:
  python -m training.train_xray_model
"""

import os
import sys
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader


def get_project_root():
    """Get the lungguard-ai project root directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_transforms():
    """Create training and validation image transforms."""
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    return train_transforms, val_transforms


def build_model(num_classes: int, device: torch.device) -> nn.Module:
    """Build ResNet18 with transfer learning."""
    print("Loading ResNet18 with ImageNet pretrained weights...")
    try:
        model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    except (AttributeError, TypeError):
        model = models.resnet18(pretrained=True)

    # Freeze all convolutional layers
    for param in model.parameters():
        param.requires_grad = False

    # Replace final FC layer for our classification task
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_ftrs, num_classes)
    )

    model = model.to(device)
    return model


def train_one_epoch(model, dataloader, criterion, optimizer, device, dataset_size):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    running_corrects = 0

    for inputs, labels in dataloader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        _, preds = torch.max(outputs, 1)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        running_corrects += torch.sum(preds == labels.data)

    epoch_loss = running_loss / dataset_size
    epoch_acc = running_corrects.double() / dataset_size
    return epoch_loss, epoch_acc.item()


def validate(model, dataloader, criterion, device, dataset_size):
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    running_corrects = 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

    epoch_loss = running_loss / dataset_size
    epoch_acc = running_corrects.double() / dataset_size
    return epoch_loss, epoch_acc.item()


def main():
    project_root = get_project_root()
    train_dir = os.path.join(project_root, "dataset", "chest_xray", "train")
    val_dir = os.path.join(project_root, "dataset", "chest_xray", "test")
    output_path = os.path.join(project_root, "saved_models", "xray_resnet18.pth")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # ── Validate dataset ────────────────────────────────────────────
    if not os.path.exists(train_dir):
        print(f"[ERROR] Training directory not found: {train_dir}")
        sys.exit(1)
    if not os.path.exists(val_dir):
        print(f"[ERROR] Validation directory not found: {val_dir}")
        sys.exit(1)

    print("=" * 60)
    print("  LUNGGUARD — CHEST X-RAY MODEL TRAINING")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # ── Load datasets ───────────────────────────────────────────────
    train_transforms, val_transforms = create_transforms()

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)

    class_names = train_dataset.classes
    num_classes = len(class_names)
    print(f"Classes: {class_names} ({num_classes})")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # Sample for faster training on CPU
    max_train_samples = 1000
    if len(train_dataset) > max_train_samples:
        print(f"  Sampling {max_train_samples} training samples for faster execution on CPU...")
        indices = torch.randperm(len(train_dataset))[:max_train_samples]
        train_dataset = torch.utils.data.Subset(train_dataset, indices)
        print(f"New training samples count: {len(train_dataset)}")

    max_val_samples = 200
    if len(val_dataset) > max_val_samples:
        print(f"  Sampling {max_val_samples} validation samples...")
        indices = torch.randperm(len(val_dataset))[:max_val_samples]
        val_dataset = torch.utils.data.Subset(val_dataset, indices)
        print(f"New validation samples count: {len(val_dataset)}")

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)

    # ── Build model ─────────────────────────────────────────────────
    model = build_model(num_classes, device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

    # ── Training loop ───────────────────────────────────────────────
    epochs = 3
    best_acc = 0.0

    print(f"\nTraining for {epochs} epochs...")
    print("-" * 60)

    for epoch in range(epochs):
        start_time = time.time()

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device, len(train_dataset)
        )
        val_loss, val_acc = validate(
            model, val_loader, criterion, device, len(val_dataset)
        )

        scheduler.step()
        elapsed = time.time() - start_time

        print(
            f"Epoch [{epoch+1}/{epochs}] "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | "
            f"Time: {elapsed:.1f}s"
        )

        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), output_path)

    print("-" * 60)
    print(f"\n[OK] Best validation accuracy: {best_acc:.4f}")
    print(f"[OK] Model saved to: {output_path}")
    print(f"   File size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")

    # Save class names alongside model for inference
    meta_path = os.path.join(project_root, "saved_models", "xray_classes.txt")
    with open(meta_path, 'w') as f:
        f.write('\n'.join(class_names))
    print(f"   Class names saved to: {meta_path}")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
