
// Menu burger functionality
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navigation = document.querySelector('.navigation');
    
    if (burgerMenu && navigation) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            navigation.classList.toggle('active');
            
            // Empêcher le défilement quand le menu est ouvert
            if (navigation.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Fermer le menu quand on clique sur un lien
        document.querySelectorAll('.navigation a').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                navigation.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navigation.contains(event.target);
            const isClickOnBurger = burgerMenu.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnBurger && navigation.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                navigation.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Empêcher le comportement par défaut des boutons de filtre
    document.querySelectorAll('.tprogramme button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
});

// Gestion de la progression avec début personnalisé
class PersonalizedTrainingProgress {
    constructor() {
        this.storageKey = 'basketballTrainingPersonalized';
        this.programStartKey = 'programStartDate';
        this.init();
    }
    
    init() {
        this.initializeProgramStart();
        this.checkWeekReset();
        this.loadWeeklyProgress();
        this.setupCheckboxListeners();
        this.setupBulkActions();
        this.setupFilterSystem();
        this.displayWeekInfo();
    }
    
    // Initialiser la date de début du programme
    initializeProgramStart() {
        const savedStartDate = localStorage.getItem(this.programStartKey);
        
        if (!savedStartDate) {
            // Première visite - sauvegarder la date actuelle
            const startDate = new Date().toISOString();
            localStorage.setItem(this.programStartKey, startDate);
            console.log('🎯 Programme démarré le:', new Date(startDate).toLocaleDateString('fr-FR'));
        }
    }
    
    // Obtenir le numéro de semaine depuis le début du programme
    getCurrentWeekNumber() {
        const startDate = new Date(localStorage.getItem(this.programStartKey));
        const currentDate = new Date();
        
        // Calculer la différence en millisecondes
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7);
        
        return Math.max(1, weekNumber); // Semaine 1 minimum
    }
    
    // Obtenir les dates de début et fin de la semaine actuelle
    getWeekDateRange(weekNumber) {
        const startDate = new Date(localStorage.getItem(this.programStartKey));
        
        // Calculer le début de la semaine actuelle (jours depuis le début)
        const daysFromStart = (weekNumber - 1) * 7;
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + daysFromStart);
        
        // Fin de la semaine (6 jours après le début)
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        
        return {
            start: weekStartDate,
            end: weekEndDate
        };
    }
    
    // Vérifier et réinitialiser si c'est une nouvelle semaine
    checkWeekReset() {
        const currentWeek = this.getCurrentWeekNumber();
        const savedWeek = localStorage.getItem('currentTrainingWeek');
        const savedData = localStorage.getItem(this.storageKey);
        
        // Si c'est une nouvelle semaine ou première utilisation
        if (!savedWeek || parseInt(savedWeek) !== currentWeek) {
            if (savedData && savedWeek) {
                console.log(`🏀 Nouvelle semaine! Passage de la semaine ${savedWeek} à la semaine ${currentWeek}`);
            }
            localStorage.setItem('currentTrainingWeek', currentWeek.toString());
            
            // Réinitialiser seulement les cases cochées, pas la date de début
            if (savedWeek && parseInt(savedWeek) !== currentWeek) {
                localStorage.removeItem(this.storageKey);
            }
        }
    }
    
    // Générer un ID unique pour chaque checkbox
    getCheckboxId(checkbox) {
        const day = checkbox.closest('.programme-day');
        const dayTitle = day.querySelector('h2').textContent.trim();
        const exercise = checkbox.nextElementSibling.textContent.trim();
        return `${dayTitle}-${exercise}`.replace(/\s+/g, '_');
    }
    
    // Charger la progression de la semaine
    loadWeeklyProgress() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const progress = JSON.parse(saved);
            
            document.querySelectorAll('.check input[type="checkbox"]').forEach(checkbox => {
                const id = this.getCheckboxId(checkbox);
                if (progress[id]) {
                    checkbox.checked = true;
                    this.updateVisualState(checkbox);
                }
            });
        }
    }
    
    // Mettre à jour l'apparence visuelle
    updateVisualState(checkbox) {
        const label = checkbox.nextElementSibling;
        if (checkbox.checked) {
            label.style.textDecoration = 'line-through';
            label.style.color = '#888';
        } else {
            label.style.textDecoration = 'none';
            label.style.color = 'white';
        }
    }
    
    // Sauvegarder l'état d'une checkbox
    saveCheckboxState(checkbox) {
        const saved = localStorage.getItem(this.storageKey) || '{}';
        const progress = JSON.parse(saved);
        const id = this.getCheckboxId(checkbox);
        
        progress[id] = checkbox.checked;
        localStorage.setItem(this.storageKey, JSON.stringify(progress));
    }
    
    // Afficher les informations de la semaine
    displayWeekInfo() {
        const currentWeek = this.getCurrentWeekNumber();
        const weekDates = this.getWeekDateRange(currentWeek);
        
        const options = { day: 'numeric', month: 'long' };
        const weekRange = `Du ${weekDates.start.toLocaleDateString('fr-FR', options)} au ${weekDates.end.toLocaleDateString('fr-FR', options)}`;
        
        const startDate = new Date(localStorage.getItem(this.programStartKey));
        const programDuration = this.getProgramDuration();
        
        // Créer ou mettre à jour l'affichage
        let weekInfo = document.querySelector('.week-info');
        if (!weekInfo) {
            weekInfo = document.createElement('div');
            weekInfo.className = 'week-info';
            document.querySelector('.hero-programme').prepend(weekInfo);
        }
        
        weekInfo.innerHTML = `
            <div class="week-display">
                <div class="week-main-info">
                    <span class="week-badge">Semaine ${currentWeek}</span>
                    <span class="week-dates">${weekRange}</span>
                </div>
                <div class="program-info">
                    <span class="program-duration">${programDuration}</span>
                    <button class="reset-week-btn" title="Réinitialiser cette semaine">🔄</button>
                    <button class="restart-program-btn" title="Redémarrer tout le programme">🔄</button>
                </div>
            </div>
        `;
        
        // Bouton de réinitialisation de la semaine
        weekInfo.querySelector('.reset-week-btn').addEventListener('click', () => {
            this.resetCurrentWeek();
        });
        
        // Bouton de redémarrage complet
        weekInfo.querySelector('.restart-program-btn').addEventListener('click', () => {
            this.restartCompleteProgram();
        });
    }
    
    // Obtenir la durée du programme
    getProgramDuration() {
        const startDate = new Date(localStorage.getItem(this.programStartKey));
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Premier jour";
        if (diffDays === 1) return "1 jour de programme";
        return `${diffDays} jours de programme`;
    }
    
    // Réinitialiser la semaine en cours
    resetCurrentWeek() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les exercices de cette semaine ?')) {
            document.querySelectorAll('.check input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                this.updateVisualState(checkbox);
            });
            localStorage.removeItem(this.storageKey);
            console.log('📝 Semaine réinitialisée!');
        }
    }
    
    // Redémarrer complètement le programme
    restartCompleteProgram() {
        if (confirm('Êtes-vous sûr de vouloir redémarrer complètement le programme ? Cela réinitialisera toutes vos données et recommencera à la semaine 1.')) {
            // Sauvegarder la nouvelle date de début
            const newStartDate = new Date().toISOString();
            localStorage.setItem(this.programStartKey, newStartDate);
            
            // Réinitialiser toutes les données
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('currentTrainingWeek');
            
            document.querySelectorAll('.check input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                this.updateVisualState(checkbox);
            });
            
            // Recharger pour mettre à jour l'affichage
            setTimeout(() => {
                this.displayWeekInfo();
            }, 100);
            
            console.log('🔄 Programme complètement redémarré!');
        }
    }
    
    // Écouteurs pour les cases individuelles
    setupCheckboxListeners() {
        document.querySelectorAll('.check input[type="checkbox"]').forEach(checkbox => {
            this.updateVisualState(checkbox);
            
            checkbox.addEventListener('change', () => {
                this.updateVisualState(checkbox);
                this.saveCheckboxState(checkbox);
            });
        });
    }
    
    // Actions en masse (Tout cocher/Annuler)
    setupBulkActions() {
        document.querySelectorAll('.programme-day').forEach(day => {
            const checkAllBtn = day.querySelector('.tprogramme button:first-child');
            const cancelBtn = day.querySelector('.tprogramme button:last-child');
            const checkboxes = day.querySelectorAll('input[type="checkbox"]');
            
            checkAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    this.updateVisualState(checkbox);
                    this.saveCheckboxState(checkbox);
                });
            });
            
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    this.updateVisualState(checkbox);
                    this.saveCheckboxState(checkbox);
                });
            });
        });
    }
    
    // Système de filtrage
    setupFilterSystem() {
        const filterButtons = document.querySelectorAll('.hero-programme .tprogramme button');
        const programmeDays = document.querySelectorAll('.programme-day');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filter = button.textContent.toLowerCase();
                
                programmeDays.forEach(day => {
                    if (filter === 'tout') {
                        day.style.display = 'block';
                    } else {
                        const dayType = day.id.toLowerCase();
                        day.style.display = dayType.includes(filter) ? 'block' : 'none';
                    }
                });
            });
        });
        
        const toutBtn = Array.from(filterButtons).find(btn => 
            btn.textContent.toLowerCase() === 'tout'
        );
        if (toutBtn) toutBtn.click();
    }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
    new PersonalizedTrainingProgress();
});