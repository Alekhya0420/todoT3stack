let totalTests = 0;
let passedTests = 0;

beforeEach(() => {
  totalTests++;
});

afterEach(function () {
  // If a test passes, increment the count
  if (this.currentTest.state === 'passed') {
    passedTests++;
  }
});

after(() => {
  // Calculate success ratio after all tests
  const successRatio = (passedTests / totalTests) * 100;
  console.log(`Login Success Ratio: ${successRatio.toFixed(2)}%`);
});
