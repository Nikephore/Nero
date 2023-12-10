const {
  AttachmentBuilder,
  Client,
  Events,
  GatewayIntentBits,
} = require("discord.js");
const { createCanvas, Image } = require("@napi-rs/canvas");
const { request } = require("undici");

const applyText = (canvas, text) => {
  const context = canvas.getContext("2d");
  let fontSize = 70;

  do {
    context.font = `${(fontSize -= 10)}px sans-serif`;
  } while (context.measureText(text).width > canvas.width - 300);

  return context.font;
};

async function createImage(interaction, padoruURL, id) {
  const canvas = createCanvas(750, 750);
  const context = canvas.getContext("2d");

  // Descargar la imagen desde la URL proporcionada
  const { body } = await request(
    "https://nerobotfiles.s3.eu-west-3.amazonaws.com/backgrounds/cit_2a.png"
  );
  const backgroundImage = new Image();
  backgroundImage.src = Buffer.from(await body.arrayBuffer());

  // Dibujar el fondo
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const padoruSize = 750; // Ajusta el tamaño de padoru según tus preferencias
  const padoruMargin = 10;

  // Calcular las coordenadas para centrar la imagen de padoru
  const padoruX = (canvas.width - padoruSize) / 2;
  const padoruY = (canvas.height - padoruSize) / 2;

  const padoruResponse = await request(padoruURL);
  const padoruImage = new Image();
  padoruImage.src = Buffer.from(await padoruResponse.body.arrayBuffer());

  // Dibujar el avatar
  context.drawImage(
    padoruImage,
    padoruX + padoruMargin,
    padoruY + padoruMargin,
    padoruSize - 2 * padoruMargin,
    padoruSize - 2 * padoruMargin
  );

  // Crear la imagen de perfil
  const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: `padoru_${id}`,
  });

  console.log("imagen creada")

  // Responder con la imagen de perfil
  return attachment;
}

// Función para crear imágenes de manera paralela e insertar un nuevo campo 'att'
async function createImagesParallel(interaction, padorupedia) {
  // Mapear el array de padorupedia a un array de promesas
  const promises = padorupedia.map(async (padoru) => {
    // Llamar a createImage para obtener el resultado
    const result = await createImage(interaction, padoru.image, padoru.id);

    // Insertar un nuevo campo 'att' en el objeto padoru con la información deseada
    padoru.att = result;

    // Retornar el objeto padoru modificado
    return padoru;
  });

  // Ejecutar las promesas de manera paralela
  const results = await Promise.all(promises);

  return results;

  // `results` contendrá el array de padorupedia con el nuevo campo 'att'
  console.log(results);
}

module.exports = {
  createImage,
  createImagesParallel,
};
