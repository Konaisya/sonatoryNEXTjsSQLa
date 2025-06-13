import os
from fastapi import UploadFile

def save_image(image: UploadFile) -> str:
    save_path = f'images'
    os.makedirs(save_path, exist_ok=True)
    image_path = os.path.join(save_path, image.filename)

    with open(image_path, "wb") as f:
        f.write(image.file.read())
        
    return image_path

def delete_image(image: str) -> None:
    if image == "placeholder.png":
        return
    save_path = f'images'
    image_path = os.path.join(save_path, image)
    if os.path.exists(image_path):
        os.remove(image_path)