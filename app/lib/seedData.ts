import { getCollection } from './mongodb';
import { Message } from '@/types/chat';

export async function seedTestData() {
    const collection = await getCollection('messages');

    // Vérifier si des données existent déjà
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
        console.log('Données de test déjà présentes');
        return;
    }

    const testMessages: Omit<Message, '_id'>[] = [
        {
            content: 'Bonjour tout le monde !',
            username: 'alice',
            room: 'general',
            timestamp: new Date('2024-01-15T10:00:00Z')
        },
        {
            content: 'Salut Alice !',
            username: 'bob',
            room: 'general',
            timestamp: new Date('2024-01-15T10:01:00Z')
        },
        {
            content: 'Comment ça va ?',
            username: 'alice',
            room: 'general',
            timestamp: new Date('2024-01-15T10:02:00Z')
        },
        {
            content: 'Très bien merci !',
            username: 'bob',
            room: 'general',
            timestamp: new Date('2024-01-15T10:03:00Z')
        },
        {
            content: 'Quelqu\'un a des nouvelles du projet ?',
            username: 'admin',
            room: 'tech',
            timestamp: new Date('2024-01-15T11:00:00Z')
        },
        {
            content: 'Oui, on avance bien !',
            username: 'developer',
            room: 'tech',
            timestamp: new Date('2024-01-15T11:01:00Z')
        },
        {
            content: 'Parfait !',
            username: 'admin',
            room: 'tech',
            timestamp: new Date('2024-01-15T11:02:00Z')
        },
        {
            content: 'Test de la nouvelle fonctionnalité',
            username: 'tester',
            room: 'testing',
            timestamp: new Date('2024-01-15T12:00:00Z')
        },
        {
            content: 'Fonctionne parfaitement !',
            username: 'developer',
            room: 'testing',
            timestamp: new Date('2024-01-15T12:01:00Z')
        },
        {
            content: 'Super !',
            username: 'tester',
            room: 'testing',
            timestamp: new Date('2024-01-15T12:02:00Z')
        }
    ];

    try {
        await collection.insertMany(testMessages);
        console.log('Données de test ajoutées avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'ajout des données de test:', error);
    }
} 