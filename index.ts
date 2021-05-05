import express from "express";
import fs, { promises as fsPromises } from "fs";
import sharp from "sharp";
const app = express();

const PORT = 3000;

const thumbFolder = "thumb";

const imagesFolder = "images";

app.get("/api/images", (req, res) => {
  try {
    const filename: any = req.query["filename"];
    const width: any = req.query["width"];
    const height: any = req.query["height"];
    const name = filename.split(".")[0];
    const extension = filename.split(".")[1];
    fs.stat(
      `${thumbFolder}/${name}_${width}_${height}.${extension}`,
      (err, stats) => {
        if (!err) {
          const readStream = fs.createReadStream(
            `${thumbFolder}/${name}_${width}_${height}.${extension}`,
            { flags: "r+" }
          );
          readStream.pipe(res);

          return;
        }

        if ((err.code = "ENONT")) {
          if (!fs.existsSync(thumbFolder)) {
            fs.mkdirSync(thumbFolder);
          }
          const readFileStream = fs.createReadStream(
            `${imagesFolder}/${filename}`
          );
          readFileStream.on("error", (err: Error) => {
            return res.status(500).send({
              message: err.message,
            });
          });
          const transform = sharp().resize(parseInt(width), parseInt(height));
          const cacheFileStream = fs.createWriteStream(
            `${thumbFolder}/${name}_${width}_${height}.${extension}`,
            { flags: "w+" }
          );
          readFileStream.pipe(transform).pipe(cacheFileStream);

          cacheFileStream.on("finish", () => {
            const readStream = fs.createReadStream(
              `${thumbFolder}/${name}_${width}_${height}.${extension}`,
              { flags: "r+" }
            );
            readStream.pipe(res);
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listeneing on Port: ${PORT}`);
});
