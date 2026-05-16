# Script para remover fundo da imagem colchao.v1 usando rembg
# Execute: python remove_bg_colchao.py


from rembg import remove
from PIL import Image
import os

# Detectar extensão do arquivo colchao.v1
script_dir = os.path.dirname(__file__)
input_path = os.path.join(script_dir, 'colchao.v1.png')
output_path = os.path.join(script_dir, 'colchao.png')
if not os.path.exists(input_path):
    # Tenta buscar na pasta acima
    alt_path = os.path.abspath(os.path.join(script_dir, '..', 'colchao.v1.png'))
    if os.path.exists(alt_path):
        input_path = alt_path
    else:
        raise FileNotFoundError(f'Arquivo não encontrado: {input_path} ou {alt_path}')
input_image = Image.open(input_path)
output_image = remove(input_image)
output_image.save(output_path)
print(f'Fundo removido com sucesso! Imagem salva em: {output_path}')
