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

  submit() {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.auth.isAccountLocked(this.email)) {
      this.errorMessage = 'Compte temporairement bloqué. Trop de tentatives échouées.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate network delay for realism
    setTimeout(() => {
      const result = this.auth.login(this.email, this.password);

      if (result.success && result.user) {
        this.router.navigate([result.user.role === 'chef' ? '/chef/dashboard' : '/projects']);
      } else {
        switch (result.error) {
          case 'user_not_found':
            this.errorMessage = 'Aucun compte trouvé avec cet email';
            break;
          case 'invalid_credentials':
            const attempts = this.auth.getFailedAttempts(this.email);
            this.errorMessage = `Mot de passe incorrect (${attempts}/5 tentatives)`;
            break;
          case 'account_disabled':
            this.errorMessage = 'Ce compte a été désactivé';
            break;
          default:
            this.errorMessage = 'Erreur de connexion';
        }
      }
      this.isLoading = false;
    }, 500);
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

