// Gestion des notes personnelles
class NotesManager {
    constructor() {
        this.storageKey = 'basketballTrainingNotes';
        this.init();
    }
    
    init() {
        this.loadNotes();
        this.setupEventListeners();
    }
    
    // Obtenir la date actuelle formatée
    getCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return now.toLocaleDateString('fr-FR', options);
    }
    
    // Obtenir un format de date simple pour l'affichage
    getSimpleDate() {
        const now = new Date();
        return now.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Sauvegarder les notes dans le localStorage
    saveNotes(notes) {
        localStorage.setItem(this.storageKey, JSON.stringify(notes));
    }
    
    // Charger les notes depuis le localStorage
    loadNotes() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }
    
    // Ajouter une nouvelle note
    addNote(content) {
        if (!content.trim()) {
            alert('Veuillez écrire une note avant de l\'ajouter.');
            return;
        }
        
        const notes = this.loadNotes();
        const newNote = {
            id: Date.now(), // ID unique basé sur le timestamp
            date: this.getCurrentDate(),
            simpleDate: this.getSimpleDate(),
            content: content.trim()
        };
        
        notes.unshift(newNote); // Ajouter au début du tableau
        this.saveNotes(notes);
        this.displayNotes();
        
        // Réinitialiser le champ de texte
        document.getElementById('note').value = '';
        
        console.log('📝 Note ajoutée:', newNote);
    }
    
    // Supprimer une note
    deleteNote(noteId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            const notes = this.loadNotes();
            const filteredNotes = notes.filter(note => note.id !== noteId);
            this.saveNotes(filteredNotes);
            this.displayNotes();
            console.log('🗑️ Note supprimée:', noteId);
        }
    }
    
    // Afficher toutes les notes
    displayNotes() {
        const notesContainer = document.getElementById('notesContainer');
        const notes = this.loadNotes();
        
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="empty-notes">
                    Aucune note pour le moment. <br>
                    Ajoutez votre première note pour suivre vos progrès !
                </div>
            `;
            return;
        }
        
        notesContainer.innerHTML = notes.map(note => `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-date">
                    <span>${note.simpleDate}</span>
                    <button class="delete-note" onclick="notesManager.deleteNote(${note.id})">×</button>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
            </div>
        `).join('');
    }
    
    // Échapper le HTML pour la sécurité
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Configurer les écouteurs d'événements
    setupEventListeners() {
        const ajouterBtn = document.getElementById('ajouterBtn');
        const annulerBtn = document.getElementById('annulerBtn');
        const noteInput = document.getElementById('note');
        
        // Bouton Ajouter
        ajouterBtn.addEventListener('click', () => {
            this.addNote(noteInput.value);
        });
        
        // Bouton Annuler
        annulerBtn.addEventListener('click', () => {
            noteInput.value = '';
            noteInput.focus();
        });
        
        // Entrée pour ajouter avec la touche Enter
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNote(noteInput.value);
            }
        });
        
        // Focus automatique sur le champ de note
        noteInput.focus();
    }
}

// Initialiser le gestionnaire de notes
const notesManager = new NotesManager();

// Afficher les notes au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    notesManager.displayNotes();
});