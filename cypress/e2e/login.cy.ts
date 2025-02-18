
describe("Login Page", () => {
    beforeEach(() => {
      cy.visit("/auth/Login"); // Visits the login page before each test
    });
  
    it("should load the login form", () => {
      cy.contains("Login").should("be.visible"); // Check if Login heading is visible
      cy.get('input[name="username"]').should("be.visible"); // Username input is visible
      cy.get('input[name="password"]').should("be.visible"); // Password input is visible
      cy.get("button").contains("Login").should("be.visible"); // Login button is visible
    });
  
    it("should show an error message for invalid login", () => {
      // Fill out the form with invalid data
      cy.get('input[name="username"]').type("wronguser");
      cy.get('input[name="password"]').type("wrongpassword");
  
      // Submit the form
      cy.get("button").contains("Login").click();
  
      // Check if error message appears
      cy.contains("❌").should("be.visible"); // Error message contains the ❌ icon
    });
  
    it("should successfully log in with valid credentials", () => {
      // Assuming you have a valid username and password for testing
      const validUsername = "validuser";
      const validPassword = "validpassword";
  
      cy.get('input[name="username"]').type(validUsername);
      cy.get('input[name="password"]').type(validPassword);
      cy.get("button").contains("Login").click();
      cy.contains("✅ Login successful!").should("be.visible");
  
      
      cy.url().should("eq", "http://localhost:3000/"); 
    });
  });
  