import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/employee.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  // For demo quick login
  showQuickLogin = true;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.auth.loginAsync(this.email, this.password);

      if (result.success && result.user) {
        this.router.navigate([result.user.role === 'chef' ? '/chef/dashboard' : '/projects']);
      } else {
        switch (result.error) {
          case 'user_not_found':
            this.errorMessage = 'Aucun compte trouvé avec cet email';
            break;
          case 'invalid_credentials':
            this.errorMessage = 'Email ou mot de passe incorrect';
            break;
          case 'account_locked':
            this.errorMessage = 'Compte temporairement bloqué. Trop de tentatives échouées.';
            break;
          case 'account_disabled':
            this.errorMessage = 'Ce compte a été désactivé';
            break;
          default:
            this.errorMessage = 'Erreur de connexion';
        }
      }
    } catch (error) {
      this.errorMessage = 'Erreur de connexion au serveur';
    }

    this.isLoading = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  quickLogin(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.submit();
  }

  clearError() {
    this.errorMessage = '';
  }
}

