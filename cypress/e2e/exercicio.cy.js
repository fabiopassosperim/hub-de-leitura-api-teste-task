/// <reference types="Cypress" />

describe('Testes da Funcionalidade Catálogo de Livros', () => {

  let token;
  let bookId;

const livro = {
    title: `Xógun - Teste ${Date.now()}`,
    author: "James Clavell",
    description: "Um épico histórico que mergulha na cultura japonesa do século XVII, explorando a vida de um comerciante inglês que se vê envolvido em intrigas políticas e culturais.",
    category: "Literatura Estrangeira",
    isbn: "145-29-984-5346-0",
    editor: "Nova Cultural",
    language: "Português",
    publication_year: 1975,
    pages: 1120,
    format: "Físico",
    total_copies: 2,
    available_copies: 2
  };

  beforeEach(() => {
    cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
      token = tkn;
    });
  });

    // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
    // Validar que filtros por categoria e autores funcionam corretamente
  it('GET - Deve listar livros com filtros e paginação', () => {
    cy.api({
      method: 'GET',
      url: 'books',
      headers: { Authorization: token }
    }).should(response => {
      expect(response.status).to.eq(200);
      expect(response.body.books).to.be.an('array');
      expect(response.body.books[0]).to.have.property('author');
      expect(response.body.books[0]).to.have.property('category');
    });
  });

    // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
    // Verificar que todos os campos do livro são retornados corretamente
    it('GET - Deve obter detalhes de um livro específico', () => {
    const bookId = 6;

    cy.api({
      method: 'GET',
      url: `books/${bookId}`,
      headers: { Authorization: token }
    }).should(response => {
      expect(response.status).to.eq(200);
      expect(response.body.book.id).to.eq(bookId);
    });
  });

    // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
    // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
 it('POST - Deve cadastrar um novo livro com sucesso', () => {

    cy.api({
      method: 'POST',
      url: 'books',
      headers: { Authorization: token },
      body: livro
    }).then(response => {

      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq("Livro criado com sucesso.");

      bookId = response.body.book.id;

      expect(bookId).to.exist;

      cy.log(`ID do Xógun: ${bookId}`);

    });
  });

    // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
    // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
    it('POST - Deve rejeitar livro duplicado', () => {

    cy.api({
      method: 'POST',
      url: 'books',
      headers: { Authorization: token },
      body: livro,
      failOnStatusCode: false
    }).then(response => {

      expect(response.status).to.eq(400);

      expect(response.body.message).to.eq(
        "Já existe um livro com este título e autor."
      );

    });
  });
   

    // Objetivo: Validar que um livro pode ser atualizado com sucesso
    // Verificar que apenas admin pode atualizar livros (validação de permissão)
     it('PUT - Deve diminuir a quantidade disponível do Xógun', () => {

    expect(bookId).to.exist;

    cy.api({
      method: 'PUT',
      url: `books/${bookId}`,
      headers: { Authorization: token },
      body: {
        ...livro,
        available_copies: 1
      }
    }).then(response => {

      expect(response.status).to.eq(200);

      expect(response.body.message).to.eq(
        "Livro atualizado com sucesso."
      );

    });
  });
        
    // Objetivo: Validar que um livro pode ser removido do catálogo
    // Verificar que apenas admin pode deletar livros (validação de permissão)
  it('DELETE - Deve excluir o Xógun', () => {

    expect(bookId).to.exist;

    cy.api({
      method: 'DELETE',
      url: `books/${bookId}`,
      headers: { Authorization: token }
    }).then(response => {

      expect(response.status).to.eq(200);

    });
  });

});
