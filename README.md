# 🛒 FoodTally

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8%2B-brightgreen)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow)
![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-orange)
[![Licença MIT](https://img.shields.io/badge/licença-MIT-yellow)](LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/elias-barbosa-367280282/)

> **FoodTally** é um aplicativo web responsivo (**Mobile-First**) projetado para ser o seu assistente financeiro no supermercado.
>
> Ele permite criar listas de compras compartilhadas, estimar preços por quilo automaticamente para hortifrúti, agrupar itens por categorias (corredores) e calcular o total da sua compra em tempo real de forma colaborativa.

**Acesse o App Online:** https://food-tally.vercel.app/

---

# Tabela de Conteúdos

- [• Principais Funcionalidades](#-principais-funcionalidades)
- [• Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [• Configuração e Instalação Local](#-configuração-e-instalação-local)
- [• Licença](#-licença)

---

# Principais Funcionalidades

- • **Cálculo em Tempo Real** — Saiba exatamente quanto vai pagar antes de chegar ao caixa.
- • **Estimativa Inteligente de Peso** — Adicione itens por unidade (ex.: "3 tomates") e o aplicativo calcula automaticamente a estimativa de peso em quilogramas e o valor final utilizando uma base de pesos médios.
- • **Categorização Automática** — Os produtos são agrupados por corredores como Mercearia, Hortifrúti, Açougue, Limpeza, Bebidas, entre outros.
- • **Colaboração em Tempo Real** — Compartilhe listas através de um código de convite e acompanhe as alterações instantaneamente utilizando sincronização por *polling*.
- • **Design Mobile-First (Dark Mode)** — Interface otimizada para smartphones seguindo o conceito **Thumb Zone**, permitindo uso confortável com apenas uma mão.
- • **Modo Planejamento / Pendente** — Crie sua lista antes de sair de casa e deixe os itens aguardando atualização de preços no supermercado.
- • **Gestão de Contas e Listas** — Login seguro via Google OAuth com gerenciamento completo das listas.

---

# Tecnologias Utilizadas

| Tecnologia | Função |
|------------|--------|
| **Supabase (PostgreSQL)** | Autenticação Google OAuth, banco de dados em nuvem e segurança com RLS (*Row Level Security*). |
| **JavaScript (Vanilla / ES Modules)** | Lógica da aplicação, manipulação do DOM e modularização do projeto. |
| **HTML5 / CSS3** | Interface responsiva, Mobile-First e tema escuro. |
| **Vercel** | Hospedagem e deploy contínuo da aplicação. |

---



# Configuração e Instalação Local

## Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/FoodTally.git

cd FoodTally
```

## Execute localmente

Como o projeto utiliza **ES Modules** (`type="module"`), utilize um servidor local para evitar bloqueios de CORS.

Exemplos:

- Live Server (Visual Studio Code)
- Vite
- http-server
- XAMPP

---

# Licença

Este projeto está licenciado sob os termos da **MIT License**.

---

<div align="center">

### ⭐ Gostou do projeto?

Deixe uma **⭐ no repositório** e contribua para o crescimento do **FoodTally**.

**FoodTally — Planeje melhor. Compre melhor. 🛒**

</div>
