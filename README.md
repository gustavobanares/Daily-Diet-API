# Requisitos Funcionais (RF)

[x] Deve ser possível criar um usuário;
[x] Deve ser possível identificar o usuário entre as requisições;
[x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
[x] Nome;
[x] Descrição;
[x] Data e Hora;
[x] Está dentro ou não da dieta;

[x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima;
[x] Deve ser possível apagar uma refeição;
[x] Deve ser possível listar todas as refeições de um usuário;
[x] Deve ser possível visualizar uma única refeição;
[] Deve ser possível recuperar as métricas de um usuário:
[] Quantidade total de refeições registradas;
[] Quantidade total de refeições dentro da dieta;
[] Quantidade total de refeições fora da dieta;
[] Melhor sequência de refeições dentro da dieta;


# Requisitos Não Funcionais (RNF)
[x] O sistema deve utilizar autenticação para identificar o usuário entre as requisições;
[] O tempo de resposta da API deve ser inferior a 1 segundo para as principais operações;
[x] O sistema deve ser desenvolvido utilizando Node.js e TypeScript;


# Regras de Negócio (RN)
[x] As refeições devem estar relacionadas a um usuário;
[x] O usuário só pode visualizar, editar e apagar as refeições que ele criou;
[x] Uma refeição deve ser classificada como "dentro da dieta" ou "fora da dieta";
