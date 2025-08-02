// backend/src/routes/upload.js
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

router.post('/', upload.single('image'), async (req, res) => {
    const file = req.file;
    const apiKey = "e651c233f39f46b8aa54507347290d97";

    const data = new FormData();
    data.append('image', fs.createReadStream(file.path));

    try {
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, data, {
            headers: data.getHeaders()
        });

        // Clean up tmp file
        fs.unlinkSync(file.path);

        res.json({ url: response.data.data.url });
    } catch (err) {
        res.status(500).json({ error: 'Image upload failed', detail: err.message });
    }
});

export default router;
