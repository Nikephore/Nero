const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const AWS = require("aws-sdk");

// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();
const bucketName = "nerobotfiles"; // Nombre de tu bucket en S3

async function setExhibitor(user, id) {
  try {
    const key = `exhibitors/${user.id}.jpg`; // Utiliza la ID de Discord en el nombre del archivo

    // Crear la imagen de exhibidor con la función createImage
    const canvas = await createImage(
      `https://nerobotfiles.s3.eu-west-3.amazonaws.com/uploads/${id}/${id}.png`, user
    );

    // Obtener el contenido del canvas como un buffer en formato JPEG
    const bufferContent = canvas.toBuffer("image/jpeg");

    // Generar un timestamp único
    const timestamp = new Date().getTime();

    // Configurar los parámetros para la carga
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: bufferContent,
      ContentType: "image/jpeg",
      ACL: "public-read",
    };

    // Subir la imagen a S3
    const result = await s3.putObject(params).promise();

    console.log(result);

    // Obtener la URL pública del objeto con el timestamp
    const objectUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}?timestamp=${timestamp}`;

    return objectUrl; // Devuelve la URL pública de la imagen
  } catch (err) {
    console.error("Error al subir la imagen a S3:", err);
    throw err;
  }
}

async function createImage(padoruURL, user) {
  const canvas = createCanvas(1200, 630);
  const context = canvas.getContext("2d");

  // Descargar la imagen de fondo desde la URL proporcionada
  const backgroundImage = await loadImage(
    "https://nerobotfiles.s3.eu-west-3.amazonaws.com/backgrounds/default.jpg"
  );

  // Dibujar el fondo
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const padoruSize = 500; // Ajusta el tamaño de padoru según tus preferencias
  const bottomMargin = 10;
  const topMargin = 80; // Márgen desde el borde superior

  // Calcular las coordenadas para centrar la imagen de padoru
  const padoruX = (canvas.width - padoruSize) / 2;
  const padoruY = canvas.height - padoruSize - bottomMargin;

  // Descargar la imagen de padoru desde la URL proporcionada
  const padoruResponse = await axios.get(padoruURL, {
    responseType: "arraybuffer",
  });
  const padoruImage = await loadImage(Buffer.from(padoruResponse.data));

  // Dibujar el avatar
  context.drawImage(padoruImage, padoruX, padoruY, padoruSize, padoruSize);

  const exhibitorText = `${user.username.toUpperCase()}`;

  

  // Configurar el estilo del texto
  context.fillStyle = '#000'; // Color del texto (blanco)
  context.textAlign = 'center';
  context.font = '55px "UD Digi Kyokasho N-B", sans-serif'; // Fuente y tamaño del texto]

  context.fillText(exhibitorText, canvas.width / 2 + 2, topMargin + 2);

  context.font = '55px "UD Digi Kyokasho N-B", sans-serif'; // Fuente y tamaño del texto]
  context.fillStyle = '#e6b60b'; // Color del texto
  context.fillText(exhibitorText, canvas.width / 2, topMargin);



  // Devolver el canvas
  return canvas;
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
}

module.exports = {
  createImage,
  createImagesParallel,
  setExhibitor,
};
