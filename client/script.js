import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

//load interval functionality. 
let loadInterval

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
      // Update the text content of the loading indicator.
      element.textContent += '.';
      // If the loading indicator has reached three dots, reset it.
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

//this will create another interval, if we are still typing we can set the element to still typing, this is going to get the character under the same index + increment the index.
// type text plus load answers.
function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

//this is going to make the answer very random as well as the answer id.
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();

  //makes the answer even moreeeee random.
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// is AI speaking or is it us? 
//Template String.
function ChatMe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
      <div class="profile">
        <img 
      src=${isAi ? bot : user} 
      alt="${isAi ? 'bot' : 'user'}" 
        />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
      </div>
      </div>
  `
  )
}

//the trigger in order to get the AI generated response, submit handler.
const handleSubmit = async (e) => {
  e.preventDefault();  //this will prevent the default behavior of the browser.
  const data = new FormData(form);  //form data from my HTML.

  // user's 
  chatContainer.innerHTML += ChatMe(false, data.get('prompt'));
  form.reset();

  //bots
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += ChatMe(true, "", uniqueId); 
  chatContainer.scrollTop = chatContainer.scrollHeight;   //as ther users going to type i want to keep scrolling to view that message.
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  const response = await fetch ('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';
  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

//an event listener that will alow me to submit either using the arrow opthion or pressing enter.
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
