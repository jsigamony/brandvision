// Description: This file contains the code to generate a meme caption based on the company's branding information and an image and then adds the caption on the image itself.



const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const path = require('path');
const {getBrandInfo} = require('./firestore2.js');
// const { create } = require('domain');
const { createCanvas, loadImage } = require('canvas');

const systemInfo = `
You are a meme caption generator who generates the memes based on the company's Info. 
You have to generate a relevant meme caption for the company.
You will be given the company's branding info like the tone and theme of the company.

Your task is to:
1. Analyze the image content
2. Generate a witty, engaging caption
3. Keep the tone humorous and relevant
4. Consider current meme trends
5. Ensure the caption is family-friendly


`;




async function buildPrompt(brand) {   

    prompt = `

    Here is the branding information for the company:
    Brand theme : ${brand.theme}
    Brand tone : ${brand.tone}  
    Brand target : ${brand.target}
    Brand voice : ${brand.voice}

    Generate a funny meme caption for this image.
    Only output the caption and nothing else.

`

return prompt;

}



async function generate_meme_caption(imagePath) {

    const brand = await getBrandInfo('anam12');
    // const brandData = brand.toString();

    const Userprompt = await buildPrompt(brand);

    try {
        const projectId = 'your-project-id';
        const vertexAI = new VertexAI({
            project: projectId, 
            location: 'us-central1'
        }); 

        const generativeModel = vertexAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemInfo,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
                topP: 0.70,
            }
        });

        const image = fs.readFileSync(imagePath);
        const base64Image = image.toString('base64');

// Update the prompt structure to match Gemini's expected format
const prompt = {
    contents: [
        {
            role: "user",
            parts: [
                { text: Userprompt },
                { 
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Image
                    }
                }
            ]
        }
    ]
};

        const response = await generativeModel.generateContent(prompt);
        const caption = await response.response.candidates[0].content.parts[0].text;

        console.log('Generated Caption:', caption);
        return caption;

    } catch (error) {
        console.error('Error generating meme caption:', error);
        throw error;
    }
}


async function addCaptionToImage(imagePath, caption, outputPath) {
    try {
        const image = await loadImage(imagePath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, image.width, image.height);

        // Calculate dynamic font size (scales with image height)
        let fontSize = Math.floor(image.height * 0.05); // 5% of image height
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = Math.max(2, fontSize * 0.1); // Stroke thickness

        // Text wrapping function
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            let lines = [];
            
            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = context.measureText(testLine).width;
                if (testWidth > maxWidth && i > 0) {
                    lines.push(line);
                    line = words[i] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            // Adjust y position to keep text within image
            let textHeight = lines.length * lineHeight;
            let adjustedY = Math.min(y, image.height - textHeight - 10); // Avoid clipping

            lines.forEach((line, index) => {
                let lineY = adjustedY + index * lineHeight;
                context.strokeText(line, x, lineY);
                context.fillText(line, x, lineY);
            });
        }

        // Define text position (bottom center)
        const maxWidth = image.width * 0.9; // 90% of image width
        const x = image.width / 2;
        const y = image.height - fontSize * 2; // Above bottom

        // Apply text with word wrapping
        wrapText(ctx, caption, x, y, maxWidth, fontSize * 1.2);

        // Save the image
        const buffer = canvas.toBuffer('image/jpeg');
        fs.writeFileSync(outputPath, buffer);

        console.log(`Image saved with caption at: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}



// Update createMeme function
async function createMeme() {
    try {
        const imagePath = path.join(__dirname, 'meme.jpg');
        const caption = await generate_meme_caption("meme.jpg");
        const memePath = await addCaptionToImage(imagePath, caption, "./meme_with_caption.jpg");
        console.log('Meme created successfully:', memePath);
    } catch (error) {
        console.error('Error creating meme:', error);
    }
}


generate_meme_caption("meme2.jpg");

// createMeme();

module.exports = { generate_meme_caption };

