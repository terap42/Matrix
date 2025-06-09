import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.page.html',
  styleUrls: ['./mission.page.scss'],
  standalone: false,
})
export class MissionPage implements OnInit {
  
  missionForm !: FormGroup;
  selectedSkills: string[] = [];
  budgetType: 'fixed' | 'hourly' = 'fixed';
  
  // Catégories de compétences basées sur votre cahier des charges
  skillCategories = [
    {
      name: 'Design & Créatif',
      skills: ['Graphisme', 'Illustration', 'UI/UX Design', 'Motion Design', 'Identité Visuelle', 'Webdesign']
    },
    {
      name: 'Développement',
      skills: ['Frontend', 'Backend', 'Full-Stack', 'Mobile', 'WordPress', 'E-commerce']
    },
    {
      name: 'Rédaction & Traduction',
      skills: ['Rédaction Web', 'Copywriting', 'Traduction', 'Correction', 'Content Marketing']
    },
    {
      name: 'Marketing & Communication',
      skills: ['Community Management', 'SEO/SEA', 'Growth Hacking', 'Social Media', 'Email Marketing']
    },
    {
      name: 'Audiovisuel',
      skills: ['Vidéo', 'Photographie', 'Montage', 'Animation', 'Podcast']
    },
    {
      name: 'Consulting & Expertise',
      skills: ['Stratégie', 'Data Analysis', 'Formation', 'Audit', 'Conseil']
    }
  ];

  urgencyLevels = [
    { value: 'normal', label: 'Normal (2-4 semaines)', color: 'bg-green-100 text-green-800' },
    { value: 'urgent', label: 'Urgent (1-2 semaines)', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: 'Très urgent (moins d\'1 semaine)', color: 'bg-red-100 text-red-800' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.missionForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(50)]],
      category: ['', Validators.required],
      budgetType: ['fixed', Validators.required],
      budgetMin: ['', [Validators.required, Validators.min(50)]],
      budgetMax: [''],
      hourlyRate: [''],
      estimatedHours: [''],
      deadline: ['', Validators.required],
      urgency: ['normal', Validators.required],
      location: ['remote'],
      experienceLevel: ['intermediate', Validators.required],
      additionalInfo: ['']
    });
  }

  toggleSkill(skill: string) {
    const index = this.selectedSkills.indexOf(skill);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  onBudgetTypeChange(type: 'fixed' | 'hourly') {
    this.budgetType = type;
    this.missionForm.patchValue({ budgetType: type });
    
    if (type === 'fixed') {
      this.missionForm.get('hourlyRate')?.clearValidators();
      this.missionForm.get('estimatedHours')?.clearValidators();
      this.missionForm.get('budgetMin')?.setValidators([Validators.required, Validators.min(50)]);
    } else {
      this.missionForm.get('budgetMin')?.clearValidators();
      this.missionForm.get('budgetMax')?.clearValidators();
      this.missionForm.get('hourlyRate')?.setValidators([Validators.required, Validators.min(10)]);
      this.missionForm.get('estimatedHours')?.setValidators([Validators.required, Validators.min(1)]);
    }
    
    this.missionForm.get('hourlyRate')?.updateValueAndValidity();
    this.missionForm.get('estimatedHours')?.updateValueAndValidity();
    this.missionForm.get('budgetMin')?.updateValueAndValidity();
    this.missionForm.get('budgetMax')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.missionForm.valid && this.selectedSkills.length > 0) {
      const missionData = {
        ...this.missionForm.value,
        skills: this.selectedSkills,
        createdAt: new Date(),
        status: 'active',
        applicationsCount: 0
      };
      
      console.log('Mission créée:', missionData);
      // Ici vous ajouterez l'appel à votre service Firebase
      
      // Redirection vers la page des missions
      this.navCtrl.navigateBack('/mission');
    }
  }

  goBack() {
    this.navCtrl.back();
  }
}