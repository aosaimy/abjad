// Define the Abjad values for Arabic letters.
const abjadMapping: { [letter: string]: number } = {
    "ا": 1,
    "ب": 2,
    "ج": 3,
    "د": 4,
    "ه": 5,
    "و": 6,
    "ز": 7,
    "ح": 8,
    "ط": 9,
    "ي": 10,
    "ك": 20,
    "ل": 30,
    "م": 40,
    "ن": 50,
    "س": 60,
    "ع": 70,
    "ف": 80,
    "ص": 90,
    "ق": 100,
    "ر": 200,
    "ش": 300,
    "ت": 400,
    "ث": 500,
    "خ": 600,
    "ذ": 700,
    "ض": 800,
    "ظ": 900,
    "غ": 1000
  };
  
  /**
   * Calculate the Abjad numeral sum for a given Arabic text.
   * (Any characters not in the mapping are ignored.)
   */
  function calculateAbjad(text: string): number {
    let sum = 0;
    for (const char of text) {
      if (abjadMapping[char]) {
        sum += abjadMapping[char];
      }
    }
    return sum;
  }
  
  /**
   * Validate a candidate word by POSTing to the given API endpoint.
   * The API is expected to return JSON with a boolean property "isValid".
   */
  async function validateWord(word: string): Promise<boolean> {
    try {
      const response = await fetch("https://example.com/validateWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ word })
      });
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error("Error validating word:", error);
      return false;
    }
  }
  
  /**
   * Given a target number, search for candidate word(s) (up to maxWordLength letters)
   * whose Abjad numeral sum equals the target.
   *
   * This is a naive backtracking approach. For every candidate that reaches the target sum,
   * the candidate is sent to the API endpoint for validation.
   */
  async function findValidWordsForNumber(target: number, maxWordLength: number = 3): Promise<string[]> {
    const validWords: string[] = [];
  
    // Recursive helper function.
    async function search(currentWord: string, currentSum: number) {
      // When the current sum equals the target and we have at least one letter,
      // check if the candidate word is valid.
      if (currentSum === target && currentWord.length > 0) {
        if (await validateWord(currentWord)) {
          validWords.push(currentWord);
        }
        // Do not extend further once the target is reached.
        return;
      }
      // Stop searching if the word is too long or if the sum exceeds the target.
      if (currentWord.length >= maxWordLength || currentSum > target) {
        return;
      }
      // Try adding each letter in turn.
      for (const letter of Object.keys(abjadMapping)) {
        await search(currentWord + letter, currentSum + abjadMapping[letter]);
      }
    }
  
    await search("", 0);
    return validWords;
  }
  
  /* ----- UI Event Handlers ----- */
  document.addEventListener("DOMContentLoaded", () => {
    // Section 1: Calculate Abjad numeral for a given Arabic text.
    const arabicTextInput = document.getElementById("arabicText") as HTMLInputElement;
    const calculateAbjadBtn = document.getElementById("calculateAbjadBtn") as HTMLButtonElement;
    const abjadResultDiv = document.getElementById("abjadResult") as HTMLDivElement;
  
    calculateAbjadBtn.addEventListener("click", () => {
      const text = arabicTextInput.value;
      const sum = calculateAbjad(text);
      abjadResultDiv.textContent = `Abjad numeral value: ${sum}`;
    });
  
    // Section 2: Given a number, find valid Arabic word(s) whose Abjad sum equals that number.
    const targetNumberInput = document.getElementById("targetNumber") as HTMLInputElement;
    const findWordBtn = document.getElementById("findWordBtn") as HTMLButtonElement;
    const wordResultDiv = document.getElementById("wordResult") as HTMLDivElement;
  
    findWordBtn.addEventListener("click", async () => {
      const targetNumber = parseInt(targetNumberInput.value);
      if (isNaN(targetNumber) || targetNumber <= 0) {
        wordResultDiv.textContent = "Please enter a valid positive number.";
        return;
      }
      wordResultDiv.textContent = "Searching for valid words...";
      const validWords = await findValidWordsForNumber(targetNumber, 3);
      if (validWords.length > 0) {
        wordResultDiv.textContent = `Found valid word(s): ${validWords.join(", ")}`;
      } else {
        wordResultDiv.textContent = "No valid word found.";
      }
    });
  });
  