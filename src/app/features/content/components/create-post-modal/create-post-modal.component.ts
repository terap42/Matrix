import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

export interface CreatePostData {
  title?: string;
  content: string;
  type: 'text' | 'project' | 'achievement';
  files: File[];
  isUrgent: boolean;
  project?: {
    title: string;
    description: string;
    technologies: string[];
    budget?: string;
    duration?: string;
  };
}

export interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size: string;
}

@Component({
  selector: 'app-create-post-modal',
  templateUrl: './create-post-modal.component.html',
  styleUrls: ['./create-post-modal.component.scss'],
  standalone: false
})
export class CreatePostModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() currentUser: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitPost = new EventEmitter<CreatePostData>();

  postForm!: FormGroup;
  selectedFiles: FilePreview[] = [];
  postType: 'text' | 'project' | 'achievement' = 'text';
  isUrgent = false;
  technologies: string[] = [];
  techInput = '';
  isSubmitting = false;
  
  // Limites
  readonly MAX_FILES = 5;
  readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  readonly ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.postForm = this.fb.group({
      title: [''],
      content: ['', [Validators.required, Validators.minLength(10)]],
      projectTitle: [''],
      projectDescription: [''],
      projectBudget: [''],
      projectDuration: ['']
    });

    // Validation conditionnelle pour les projets
    this.postForm.get('content')?.valueChanges.subscribe(() => {
      this.updateValidation();
    });
  }

  private updateValidation() {
    const contentControl = this.postForm.get('content');
    const projectTitleControl = this.postForm.get('projectTitle');
    const projectDescControl = this.postForm.get('projectDescription');

    if (this.postType === 'project') {
      projectTitleControl?.setValidators([Validators.required]);
      projectDescControl?.setValidators([Validators.required]);
    } else {
      projectTitleControl?.clearValidators();
      projectDescControl?.clearValidators();
    }

    projectTitleControl?.updateValueAndValidity();
    projectDescControl?.updateValueAndValidity();
  }

  onClose() {
    if (this.isSubmitting) return;
    this.resetForm();
    this.closeModal.emit();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    
    for (const file of files) {
      if (this.selectedFiles.length >= this.MAX_FILES) {
        this.showToast(`Maximum ${this.MAX_FILES} fichiers autorisés`, 'warning');
        break;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        this.showToast(`Le fichier "${file.name}" est trop volumineux (max 50MB)`, 'warning');
        continue;
      }

      if (!this.isValidFileType(file)) {
        this.showToast(`Type de fichier non supporté: ${file.name}`, 'warning');
        continue;
      }

      this.addFilePreview(file);
    }

    // Reset input
    input.value = '';
  }

  private isValidFileType(file: File): boolean {
    const allTypes = [...this.ALLOWED_TYPES.image, ...this.ALLOWED_TYPES.video, ...this.ALLOWED_TYPES.document];
    return allTypes.includes(file.type);
  }

  private addFilePreview(file: File) {
    const preview: FilePreview = {
      file,
      url: '',
      type: this.getFileType(file),
      name: file.name,
      size: this.formatFileSize(file.size)
    };

    if (preview.type === 'image' || preview.type === 'video') {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.url = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    this.selectedFiles.push(preview);
  }

  private getFileType(file: File): 'image' | 'video' | 'document' {
    if (this.ALLOWED_TYPES.image.includes(file.type)) return 'image';
    if (this.ALLOWED_TYPES.video.includes(file.type)) return 'video';
    return 'document';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  removeFile(index: number) {
    if (this.isSubmitting) return;
    this.selectedFiles.splice(index, 1);
  }

  onTypeChange(type: 'text' | 'project' | 'achievement') {
    if (this.isSubmitting) return;
    
    this.postType = type;
    
    // Reset project fields if not project type
    if (type !== 'project') {
      this.postForm.patchValue({
        projectTitle: '',
        projectDescription: '',
        projectBudget: '',
        projectDuration: ''
      });
      this.technologies = [];
    }

    this.updateValidation();
  }

  addTechnology() {
    if (this.isSubmitting) return;
    
    const tech = this.techInput.trim();
    if (tech && !this.technologies.includes(tech) && this.technologies.length < 10) {
      this.technologies.push(tech);
      this.techInput = '';
    }
  }

  removeTechnology(index: number) {
    if (this.isSubmitting) return;
    this.technologies.splice(index, 1);
  }

  onTechKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTechnology();
    }
  }

  toggleUrgent() {
    if (this.isSubmitting) return;
    this.isUrgent = !this.isUrgent;
  }

  triggerFileInput() {
    if (this.isSubmitting) return;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  async onSubmit() {
    if (this.isSubmitting) return;

    // Validation du formulaire
    if (!this.postForm.valid) {
      this.markFormGroupTouched(this.postForm);
      this.showToast('Veuillez corriger les erreurs dans le formulaire', 'warning');
      return;
    }

    // Validation spécifique pour les projets
    if (this.postType === 'project') {
      const formValue = this.postForm.value;
      if (!formValue.projectTitle || !formValue.projectDescription) {
        this.showToast('Titre et description du projet sont requis', 'warning');
        return;
      }
    }

    this.isSubmitting = true;

    try {
      const formValue = this.postForm.value;
      
      // Préparer les données selon le format attendu par le backend
      const postData: CreatePostData = {
        title: formValue.title || undefined,
        content: formValue.content,
        type: this.postType,
        files: this.selectedFiles.map(f => f.file),
        isUrgent: this.isUrgent
      };

      // Ajouter les données projet si nécessaire
      if (this.postType === 'project') {
        postData.project = {
          title: formValue.projectTitle,
          description: formValue.projectDescription,
          technologies: this.technologies,
          budget: formValue.projectBudget || undefined,
          duration: formValue.projectDuration || undefined
        };
      }

      console.log('📤 Envoi données post:', {
        type: postData.type,
        contentLength: postData.content.length,
        filesCount: postData.files.length,
        hasProject: !!postData.project
      });

      this.submitPost.emit(postData);
      this.resetForm();

    } catch (error) {
      console.error('❌ Erreur préparation post:', error);
      this.showToast('Erreur lors de la préparation du post', 'danger');
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm() {
    this.isSubmitting = false;
    this.postForm.reset();
    this.selectedFiles = [];
    this.postType = 'text';
    this.isUrgent = false;
    this.technologies = [];
    this.techInput = '';
    this.initializeForm();
  }

  // Getters pour les erreurs de validation
  get contentError(): string | null {
    const control = this.postForm.get('content');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Le contenu est requis';
      if (control.errors['minlength']) return 'Le contenu doit contenir au moins 10 caractères';
    }
    return null;
  }

  get projectTitleError(): string | null {
    const control = this.postForm.get('projectTitle');
    if (this.postType === 'project' && control?.touched && control?.errors?.['required']) {
      return 'Le titre du projet est requis';
    }
    return null;
  }

  get projectDescriptionError(): string | null {
    const control = this.postForm.get('projectDescription');
    if (this.postType === 'project' && control?.touched && control?.errors?.['required']) {
      return 'La description du projet est requise';
    }
    return null;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
  }

  getUserAvatar(): string {
    return this.currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}