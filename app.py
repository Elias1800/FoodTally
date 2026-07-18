from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)
ARQUIVO_DADOS = 'dados.json'

def ler_dados():
    if not os.path.exists(ARQUIVO_DADOS):
        return []
    with open(ARQUIVO_DADOS, 'r') as arquivo:
        return json.load(arquivo)

def salvar_dados(dados):
    with open(ARQUIVO_DADOS, 'w') as arquivo:
        json.dump(dados, arquivo, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/itens', methods=['GET', 'POST'])
def gerenciar_itens():
    if request.method == 'GET':
        return jsonify(ler_dados())
    
    if request.method == 'POST':
        novo_item = request.json
        itens = ler_dados()
        itens.append(novo_item)
        salvar_dados(itens)
        return jsonify({"mensagem": "Item salvo!"}), 201

# NOVA ROTA: Atualizar um item existente (quando sai de Pendente para o Carrinho)
@app.route('/api/itens/<int:item_id>', methods=['PUT', 'DELETE'])
def alterar_item(item_id):
    itens = ler_dados()
    
    if request.method == 'DELETE':
        itens = [item for item in itens if item.get('id') != item_id]
        salvar_dados(itens)
        return jsonify({"mensagem": "Item removido!"}), 200
        
    if request.method == 'PUT':
        dados_atualizados = request.json
        for i, item in enumerate(itens):
            if item.get('id') == item_id:
                itens[i] = dados_atualizados
                break
        salvar_dados(itens)
        return jsonify({"mensagem": "Item atualizado!"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)