# 🛒 FoodTally

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8%2B-brightgreen)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow)
![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-orange)
[![Licença MIT](https://img.shields.io/badge/licença-MIT-yellow)](LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/elias-barbosa-367280282/)

<!-- Caso tenha imagens da tela do app, coloque na pasta docs e descomente as linhas abaixo -->
<!-- ![FoodTally Banner](docs/banner.png) -->
<!-- ![Demonstração do FoodTally](docs/demo.gif) -->

> **FoodTally** é um aplicativo web responsivo (*Mobile-First*) projetado para ser o seu assistente financeiro no supermercado.  
> Ele permite criar listas de compras, estimar preços por quilo automaticamente para hortifrúti, agrupar itens por categorias (corredores) e calcular o total da sua compra em tempo real.

## Tabela de Conteúdos
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Como Usar (Local e 4G)](#como-usar-local-e-4g)
- [Próximos Passos](#próximos-passos)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Principais Funcionalidades
- **Cálculo em Tempo Real:** Saiba exatamente quanto vai pagar antes de chegar ao caixa.
- **Estimativa Inteligente de Peso:** Adicione "3 tomates" e o app calcula automaticamente a estimativa de peso (ex: 450g) e o valor final com base no preço do quilo.
- **Categorização Automática:** Os itens são agrupados visualmente por seções (Hortifrúti, Açougue, Limpeza, etc.) para facilitar a navegação no mercado.
- **Design Mobile-First (Dark Mode):** Interface desenhada para ser usada com apenas uma mão (*Thumb Zone*) e economizar bateria.
- **Modo Planejamento:** Adicione itens em casa (sem preço) e eles ficam com status "Pendente" aguardando você chegar ao mercado.

## Tecnologias
| Tecnologia | Função |
|------------|--------|
| **Python / Flask** | Backend leve e rápido para servir a aplicação web. |
| **JavaScript (Vanilla)** | Lógica de cálculo, manipulação do DOM e comunicação assíncrona (Fetch API). |
| **HTML5 / CSS3** | Estruturação e design responsivo (uso de `dvh` e CSS Grid/Flexbox). |
| **JSON** | Armazenamento local de dados (banco de dados em arquivo). |

## Instalação
1️⃣ Clone o repositório para a sua máquina:
```bash
git clone [https://github.com/SEU-USUARIO/FoodTally.git](https://github.com/SEU-USUARIO/FoodTally.git)
cd FoodTally
```
2️⃣ Instale o Flask:
```bash
pip install Flask
```

## Como Usar (Local e 4G)

### Rodando na sua máquina (Testes)
Execute o comando abaixo no terminal da pasta do projeto:
```bash
python app.py
```
O aplicativo estará disponível no navegador do seu computador em: `http://localhost:5000`

### Acessando do Celular (No Mercado via 4G)
Para acessar o aplicativo local fora de casa sem precisar de hospedagem, utilizamos a ferramenta Cloudflared:
1. Mantenha o `app.py` rodando em um terminal.
2. Abra um novo terminal e crie o túnel reverso:
```bash
cloudflared tunnel --url http://localhost:5000
```
3. O Cloudflare gerará um link seguro (ex: `https://palavra-aleatoria.trycloudflare.com`).
4. Abra esse link no seu celular e boas compras!

## Próximos Passos
- [ ] Implementar botão de "Nova Feira" para limpar o histórico.
- [ ] Migrar o armazenamento `dados.json` para o **Firebase** (Google) para persistência em nuvem.
- [ ] Permitir a criação de múltiplas listas salvas.

## Contribuição
Fique à vontade para abrir uma *Issue* relatando bugs ou enviar um *Pull Request* com melhorias no código. Toda ajuda é bem-vinda!

## Licença
Este projeto está licenciado sob os termos da [MIT License](LICENSE).