import { Component, Input } from '@angular/core';
import { CahierDeCharge } from '../../core/models/cahier.model';

@Component({
  selector: 'app-cps-preview',
  templateUrl: './cps-preview.component.html'
})
export class CpsPreviewComponent {
  @Input() cahier: CahierDeCharge | null = null;

  showPreview = false;

  get isPdf(): boolean {
    return this.cahier?.mimeType === 'application/pdf';
  }

  get isWord(): boolean {
    const mime = this.cahier?.mimeType || '';
    return mime.includes('word') || mime.includes('msword') ||
           mime.includes('openxmlformats-officedocument.wordprocessingml');
  }

  get isExcel(): boolean {
    const mime = this.cahier?.mimeType || '';
    return mime.includes('excel') || mime.includes('spreadsheet') ||
           mime.includes('openxmlformats-officedocument.spreadsheetml');
  }

  get fileTypeIcon(): string {
    if (this.isPdf) return '📕';
    if (this.isWord) return '📘';
    if (this.isExcel) return '📗';
    return '📄';
  }

  get fileTypeName(): string {
    if (this.isPdf) return 'PDF';
    if (this.isWord) return 'Word';
    if (this.isExcel) return 'Excel';
    return 'Fichier';
  }

  get dataUrl(): string {
    if (!this.cahier) return '';
    return `data:${this.cahier.mimeType};base64,${this.cahier.base64}`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  togglePreview() {
    if (this.isPdf) {
      this.showPreview = !this.showPreview;
    }
  }

  download() {
    if (!this.cahier) return;
    const link = document.createElement('a');
    link.href = this.dataUrl;
    link.download = this.cahier.fileName;
    link.click();
  }
}

