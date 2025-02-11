let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const Api_Url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCch12jENbu0dra6qRGPOxF35bFfkp68Oc"

let user={
    message:"Summarize the following text in a structured, step-by-step format with bullet points and proper paragraph spacing in 70 words",
    file:{
        mime_type:null,
        data: null
    }
}
 
async function generateResponse(aiChatBox) {

let text=aiChatBox.querySelector(".ai-chat-area")
    let RequestOption={
        method:"POST",
        headers:{'Content-Type' : 'application/json'},
        body:JSON.stringify(
            {
            "contents":[
                {"parts":[{text:user.message},(user.file.data?[{inline_data:user.file}]:[])
                

                ]
            }]
        })
    }
    




    
    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
    
        let rawResponse = data.candidates[0].content.parts[0].text;
    
        // Remove unnecessary asterisks (*) but keep bold formatting
        let formattedResponse = rawResponse
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Convert **bold text** to <b>bold text</b>
            .replace(/\*/g, "") // Remove unnecessary asterisks
            .replace(/\n{2,}/g, "</p><br><p>") // Double newlines → Paragraphs
            .replace(/\n/g, "<br><br>") // Single newlines → Line breaks
            .trim();
    
        // Convert main steps into numbered lists
        formattedResponse = formattedResponse.replace(/(?:Step )?(\d+):/g, "<li><b>Step $1:</b></li>");
    
        // Convert sub-steps starting with "-", "•", or indentation into bullet points
        formattedResponse = formattedResponse.replace(/(?:-|\•)\s(.*?)(?=<br>|$)/g, "<ul><li>• $1</li></ul>");
    
        // Ensure bullet points are inside ordered list items
        formattedResponse = formattedResponse.replace(/<\/ul><br>/g, "</ul><br>"); // Remove extra line breaks after bullet points
    
        // Wrap main steps inside <ol> tags if there are any steps
        if (/<li><b>Step/.test(formattedResponse)) {
            formattedResponse = "<ol>" + formattedResponse + "</ol>";
        } else {
            formattedResponse = `<p>${formattedResponse}</p>`; // Wrap general text inside paragraphs
        }
    
        // Ensure proper sentence ending
        formattedResponse = formattedResponse.replace(/(<br>)+$/, "");
    
        // Assign the formatted HTML to the innerHTML of text
        text.innerHTML = formattedResponse;
    
    } catch (error) {
        console.log(error);
        text.innerHTML = "Error generating response. Please try again.";
    }
    
    
    
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={}
    }
}



function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(userMessage){
    user.message=userMessage
    let html=`<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
prompt.value=""
let userChatBox=createChatBox(html,"user-chat-box")
chatContainer.appendChild(userChatBox)

chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

setTimeout(()=>{
let html=`<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`
    let aiChatBox=createChatBox(html,"ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)

},600)

}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})


imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})
