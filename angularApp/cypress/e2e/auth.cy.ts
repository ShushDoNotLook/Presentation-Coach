import { TestBed } from '@angular/core/testing';
import { UserAuthService } from '../../src/app/services/auth/user-auth.service';
import { Auth } from '@angular/fire/auth';

describe('When Visting E-Coach', () => {

  it("navigates user to register page if not authenticated", () => {
    cy.visit('localhost:4200');

    cy.url().should('include', '/register');
  })

  it("provides all inputs for a user to register", () => {

    // Visit the register page
    cy.visit('localhost:4200/register');

    // Page should have a register form
    cy.get('#register').should('be.visible');
    // Page should have an email input
    cy.get('input[type="email"]').should('be.visible');
    // Page should have a password input
    cy.get('input[type="password"]').should('be.visible');
    // Page should have a submit button
    cy.get('button[type="submit"]').should('be.visible');
    // Page should have a router link to login
    cy.get('a').should('have.attr', 'routerLink', '/login'); 
    
  })

  it("provides all inputs for a user to login", () => {
    cy.visit('localhost:4200/login');

    // Page should have a login form
    cy.get('#login').should('be.visible');
    // Page should have an email input
    cy.get('input[type="email"]').should('be.visible');
    // Page should have a password input
    cy.get('input[type="password"]').should('be.visible');
    // Page should have a submit button
    cy.get('button[type="submit"]').should('be.visible');
    // Page should have a router link to register
    cy.get('a').should('have.attr', 'routerLink', '/register');
  })

    it("navigates user to dashboard page if authenticated", () => {

    // Mock the UserAuthService to simulate a logged in user

    cy.visit('localhost:4200');

    // User should be redirected to the dashboard page

  })

})