const chatInput = document.getElementById('chat-input');
const chatContent = document.getElementById('chat-content');
const sendButton = document.getElementById('button-prompt');
const resetButton = document.getElementById('button-reset');
const elementLoading = document.body.querySelector('#loading');
let topK;
let temperature;
let botResponse;
let session;

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto'; // Reset height
    chatInput.style.height = `${chatInput.scrollHeight}px`; // Adjust height dynamically
});


// Function to create a message
function createMessage(content, isUser) {
    const message = document.createElement('div');
    message.classList.add('message', isUser ? 'user-message' : 'chatbot-message');
    if(message.classList.contains('chatbot-message')){
        message.appendChild(content);
    }
    else{
        message.textContent = content;
    }
    
    return message;
}

// Send Button Functionality
sendButton.addEventListener('click', async () => {
    const messageText = chatInput.value.trim();
    if (messageText) {
        // Remove default message if present
        const defaultMessage = document.querySelector('.default-message');
        if (defaultMessage) defaultMessage.remove();

        // Add user message
        const userMessage = createMessage(messageText, true);
        chatContent.appendChild(userMessage);
        disablePrompter();
        try {
            const params = {
              temperature: temperature,
              topK: topK
            };
            botResponse = createMessage(elementLoading, false);
            const innerLoading = botResponse.querySelector('#loading');
            show(innerLoading);
            chatContent.appendChild(botResponse);
            const response = await runPrompt(messageText, params);
            hide(innerLoading);
            innerLoading.remove();
            botResponse.textContent = response;
            enablePrompter();
        } catch (e) {
            console.log(e);
            hide(botResponse.querySelector('#loading'));
            botResponse.textContent = e;
            chatContent.appendChild(botResponse);
            enablePrompter();
            reset();
        }
        // Clear the input field
        chatInput.value = '';
        chatInput.style.height = 'auto'; // Reset height
    }
});

// Reset Button Functionality
resetButton.addEventListener('click', () => {
    // Clear chat content
    chatContent.innerHTML = '<div class="default-message">How can I help you?</div>';
    chatInput.value = '';
    chatInput.style.height = 'auto'; // Reset height
    reset();
});

function disablePrompter(){
    sendButton.disabled = true;
    resetButton.disabled = true;
    chatInput.disabled = true;
}

function enablePrompter(){
    sendButton.disabled = false;
    resetButton.disabled = false;
    chatInput.disabled = false;
}

function show(element) {
  element.removeAttribute('hidden');
}
  
function hide(element) {
  element.setAttribute('hidden', '');
}

async function runPrompt(prompt, params) {
    try {
        if (!session) {
        session = await chrome.aiOriginTrial.languageModel.create(params);
        }
        return session.prompt(prompt);
    } catch (e) {
        console.log('Prompt failed');
        console.error(e);
        console.log('Prompt:', prompt);
        // Reset session
        reset();
        throw e;
    }
}

async function reset() {
    if (session) {
      session.destroy();
    }
    session = null;
}

async function initDefaults() {
    if (!('aiOriginTrial' in chrome)) {
      console.log('Error: chrome.aiOriginTrial not supported in this browser');
      return;
    }
    const defaults = await chrome.aiOriginTrial.languageModel.capabilities();
    console.log('Model default:', defaults);
    temperature = defaults.temperature;
    topK = defaults.topK;
}
  
initDefaults();