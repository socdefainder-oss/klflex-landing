from pathlib import Path
from rembg import remove, new_session
from PIL import Image

base_dir = Path(__file__).resolve().parent
src_candidates = [base_dir / "colchao.v1.png", base_dir.parent / "colchao.v1.png"]
src = next((p for p in src_candidates if p.exists()), None)
if src is None:
    raise FileNotFoundError("colchao.v1.png nao encontrado")

img = Image.open(src)

models = ["u2net", "isnet-general-use", "u2netp"]
best_path = None
best_pixels = -1

for model in models:
    session = new_session(model)
    out = remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=8,
    )
    out_path = base_dir / f"colchao-{model}.png"
    out.save(out_path)

    alpha = out.split()[-1]
    non_transparent = sum(1 for p in alpha.getdata() if p > 8)
    if non_transparent > best_pixels:
        best_pixels = non_transparent
        best_path = out_path

final_path = base_dir / "colchao.png"
Image.open(best_path).save(final_path)
print(f"Origem: {src}")
print(f"Melhor modelo: {best_path.name}")
print(f"Pixels opacos: {best_pixels}")
print(f"Saida final: {final_path}")
