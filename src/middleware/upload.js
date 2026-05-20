import multer from 'multer';
import { ALLOWED_MIMETYPES } from '../utils/fileProcessor.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(req, file, cb) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const textExts = ['txt','md','js','ts','jsx','tsx','py','java','c','cpp','cs','go','rb','php','swift','kt','rs','html','css','json','xml','yaml','yml','csv','sh','sql'];
    if (ALLOWED_MIMETYPES.has(file.mimetype) || textExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

export default upload;
