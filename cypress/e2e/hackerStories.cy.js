const faker = require('faker')

describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const pathName = '**/search'
  const newTerm = 'Cypress'

  context('Hitting on the real API', () => {
    beforeEach(() => {
      cy.intercept('GET', `${pathName}?query=${initialTerm}&page=0`).as('getStories')

      cy.visit('/')

      cy.wait('@getStories')
    })

    it('Shows 20 stories, then the next after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: pathName,
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()

      cy.wait('@getNextStories')

      cy.get('.item').should('have.length', 40)
    })

    it('Shows only search items', () => {
      cy.get('.item').should('have.length', 20)

      Cypress._.times(3, (k) => {
        cy.get('.item').eq(k).contains(initialTerm)
      })
    })
  })

  context('Last Searches', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: pathName,
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')

      cy.visit('/')

      cy.wait('@getStories')
    })
    it('Shows a max of 5 buutons for the last searched items', () => {
      cy.intercept('GET', '**/search**',
        { fixture: 'empty' }
      ).as('getRandomStories')

      Cypress._.times(6, () => {

        const randomWord = faker.random.word()

        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(`${randomWord}{enter}`)

        cy.wait('@getRandomStories')
      })

      cy.get('.last-searches')
        .within(() => {
          cy.get('button').should('have.length', 5)
        })
    })
  })
})