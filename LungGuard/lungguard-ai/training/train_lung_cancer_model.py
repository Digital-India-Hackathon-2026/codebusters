"""
LungGuard AI — Lung Cancer CT Model Training Script
====================================================
Trains a ResNet18 transfer learning model on lung cancer CT images.

Dataset structure (flat folders — script creates train/val splits):
  dataset/Bengin cases/    → Benign class
  dataset/Malignant cases/ → Malignant class
  dataset/Normal cases/    → Normal class

Classes: Benign, Malignant, Normal

Usage:
  python -m training.train_lung_cancer_model
"""

import os
import sys
import time
import shutil
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader


def get_project_root():
    """Get the lungguard-ai project root directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def prepare_dataset(project_root: str) -> tuple:
    """
    Prepare ImageFolder-compatible directory structure from flat folders.
    Creates a temporary split under dataset/_lung_cancer_split/
    """
    source_dirs = {
        'Benign': os.path.join(project_root, 'dataset', 'Bengin cases'),
        'Malignant': os.path.join(project_root, 'dataset', 'Malignant cases'),
        'Normal': os.path.join(project_root, 'dataset', 'Normal cases'),
    }

    split_root = os.path.join(project_root, 'dataset', '_lung_cancer_split')
    train_root = os.path.join(split_root, 'train')
    val_root = os.path.join(split_root, 'val')

    # Check if split already exists and is valid
    if os.path.exists(split_root):
        train_ok = all(
            os.path.exists(os.path.join(train_root, cls))
            for cls in source_dirs.keys()
        )
        val_ok = all(
            os.path.exists(os.path.join(val_root, cls))
            for cls in source_dirs.keys()
        )
        if train_ok and val_ok:
            print("Using existing train/val split...")
            return train_root, val_root

    # Clean and recreate
    if os.path.exists(split_root):
        shutil.rmtree(split_root)

    print("Creating train/val split (80/20)...")
    random.seed(42)

    for class_name, src_dir in source_dirs.items():
        if not os.path.exists(src_dir):
            print(f"[ERROR] Source directory not found: {src_dir}")
            sys.exit(1)

        # Get all image files
        images = [
            f for f in os.listdir(src_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'))
        ]
        random.shuffle(images)

        split_idx = int(len(images) * 0.8)
        train_images = images[:split_idx]
        val_images = images[split_idx:]

        # Create directories
        train_class_dir = os.path.join(train_root, class_name)
        val_class_dir = os.path.join(val_root, class_name)
        os.makedirs(train_class_dir, exist_ok=True)
        os.makedirs(val_class_dir, exist_ok=True)

        # Copy files
        for img in train_images:
            shutil.copy2(os.path.join(src_dir, img), os.path.join(train_class_dir, img))
        for img in val_images:
            shutil.copy2(os.path.join(src_dir, img), os.path.join(val_class_dir, img))

        print(f"  {class_name}: {len(train_images)} train, {len(val_images)} val")

    return train_root, val_root


def create_transforms():
    """Create training and validation image transforms."""
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
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

    # Replace final FC layer for 3-class classification
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
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
    output_path = os.path.join(project_root, "saved_models", "lung_cancer_resnet18.pth")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("=" * 60)
    print("  LUNGGUARD — LUNG CANCER CT MODEL TRAINING")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # ── Prepare dataset ─────────────────────────────────────────────
    train_dir, val_dir = prepare_dataset(project_root)

    train_transforms, val_transforms = create_transforms()

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)

    class_names = train_dataset.classes
    num_classes = len(class_names)
    print(f"\nClasses: {class_names} ({num_classes})")
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False, num_workers=0)

    # ── Build model ─────────────────────────────────────────────────
    model = build_model(num_classes, device)

    # Use weighted loss to handle potential class imbalance
    class_counts = [0] * num_classes
    for _, label in train_dataset.samples:
        class_counts[label] += 1
    total = sum(class_counts)
    class_weights = torch.FloatTensor([total / (num_classes * c) for c in class_counts]).to(device)
    print(f"Class weights: {class_weights.tolist()}")

    criterion = nn.CrossEntropyLoss(weight=class_weights)
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
    meta_path = os.path.join(project_root, "saved_models", "lung_cancer_classes.txt")
    with open(meta_path, 'w') as f:
        f.write('\n'.join(class_names))
    print(f"   Class names saved to: {meta_path}")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
