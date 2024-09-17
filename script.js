// Handle form submission
document.getElementById('chat-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userInput = document.getElementById('user-input').value;

    // Now passing the message (userInput) correctly
    appendMessage('You', userInput, 'user-input');

    // Clear input field
    document.getElementById('user-input').value = '';

    // Send user input to Gemini API
    const response = await callGeminiAPI(userInput);

    // Append the bot message element
    const botMessageElement = appendMessage('V.E.R.A', '', 'bot-message');

    // Convert markdown to HTML
    const formattedResponse = convertMarkdownToHtml(response);

    // Simulate typing effect for the bot response with formatted response
    typeMessage(botMessageElement, formattedResponse);
});

// Function to append a message to the chat box
function appendMessage(sender, message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.innerHTML = `<strong>${sender}:</strong> <span class="message-content">${message}</span>`;
    chatBox.appendChild(messageElement);
     
    
    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement.querySelector('.message-content'); // Return the content element
}

// Function to format and type message
function typeMessage(element, message, speed = 15) {
    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < message.length) {
            element.innerHTML = message.substring(0, ++index);
        } else {
            clearInterval(typingInterval);
        }
    }, speed);
}

// Function to call the Gemini API
async function callGeminiAPI(inputText) {
    const apiKey = 'AIzaSyCkz_r4iFak112BfMpDgPs9RqvMqcXxLYY';  // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: inputText }] }]
            }),
        });

        const data = await response.json();

        // Check if the response contains candidates with text
        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            return text.trim() || 'No response from API';
        } else {
            return 'No response from API';
        }

    } catch (error) {
        console.error('Error calling API:', error);
        return 'Error communicating with the API';
    }
}


function convertMarkdownToHtml(markdown) {
    // Convert headers (##, #) into HTML headings
    let html = markdown.replace(/##\s?([^\n]+)/g, '<h2>$1</h2>')
                       .replace(/#\s?([^\n]+)/g, '<h1>$1</h1>');

    // Convert bullet points (- or *) into HTML list items
    html = html.replace(/\n[-*]\s([^\n]+)/g, '<li>$1</li>');

    // Wrap list items with <ul> tags (if they exist)
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    // Remove any ** around words (used for bolding) and keep the text bold in HTML
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    // Remove any single * used for italics
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

    // Convert double new lines into paragraph breaks
    html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');

    // Wrap everything in <p> tags to make proper paragraphs
    return `<p>${html}</p>`;
}

