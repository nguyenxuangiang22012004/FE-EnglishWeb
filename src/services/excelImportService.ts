import axios from '@/config/axios';
import { AIVocabItem } from './importAIService';

/**
 * excelImportService.ts
 * Gọi API backend để:
 *   1. Preview danh sách từ từ file Excel upload lên
 *   2. Download file Excel mẫu
 */

/**
 * Upload file Excel, nhận về danh sách từ vựng đã parse (chưa lưu DB).
 */
export async function previewExcelFile(file: File): Promise<AIVocabItem[]> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post('/flashcards/import/excel/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    // BE trả về List<CreateFlashcardRequest>
    // Map sang AIVocabItem để tái dùng WordList + useImportVocabulary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.data.data as any[]).map((item) => ({
        word:         item.word         ?? '',
        meaning:      item.meaning      ?? '',
        pronunciation: item.pronunciation ?? '',
        partOfSpeech: item.partOfSpeech ?? '',
        example:      item.example      ?? '',
    }));
}

/**
 * Download file Excel mẫu về máy người dùng.
 */
export async function downloadImportTemplate(): Promise<void> {
    const res = await axios.get('/flashcards/import/template', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_tu_vung.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
