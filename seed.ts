import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './lib/firebaseAdmin';

async function seed() {
    try {
        console.log('Iniciando o seed do Firestore...');

        // 1. Criar documentos na collection 'products'
        const productsRef = db.collection('products');

        // Produto Tecassistiva
        await productsRef.doc('liber').set({
            name: 'Tecassistiva', 
            description: 'Dispositivo assistivo para deficientes visuais.',
            permissions: ['image_recognition', 'chat', 'custom_prompts'],
            createdAt: new Date().toISOString()
        });
        console.log('✅ Produto "liber" inserido.');

        // 2. Criar documentos na collection 'applications'
        const applicationsRef = db.collection('applications');

        // Módulo liber_vision
        await applicationsRef.doc('liber_vision').set({
            description: 'Módulo de Visão Computacional',
            system_prompt: 'Você é o módulo de visão do dispositivo Tecassistiva, uma tecnologia assistiva. Sua função é receber imagens e ler textos manuscritos, fazer audiodescrição detalhada e espacial de ambientes, e preparar textos para conversão em Braille. Seja objetivo e altamente descritivo visualmente.',
            llm_model: 'gemini-2.5-flash',
            temperature: 0.3,
            product_id: 'liber',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Aplicação "liber_vision" inserida.');

        // Módulo liber_chat
        await applicationsRef.doc('liber_chat').set({
            description: 'Assistente Virtual de Conversação',
            system_prompt: 'Você é o assistente virtual de conversação do dispositivo Tecassistiva. Sua função é tirar dúvidas gerais do usuário sobre qualquer assunto, de forma clara, amigável e direta. Como a saída será em áudio, evite formatações complexas, listas longas ou caracteres especiais que dificultem a leitura em voz alta.',
            llm_model: 'gemini-2.5-flash',
            temperature: 0.7,
            product_id: 'liber',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Aplicação "liber_chat" inserida.');

        // 2. Criar documento de teste na collection 'users'
        const usersRef = db.collection('users');

        await usersRef.doc('user_teste_123').set({
            email: 'bhguedess@gmail.com',
            token_balance: 50000,
            total_spent_tokens: 0,
            product_id: 'liber',
            role: 'superadmin'
        });
        console.log('✅ Usuário de teste "user_teste_123" inserido.');

        console.log('Seed concluído com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('Erro durante o seed do Firestore:', error);
        process.exit(1);
    }
}

// Executa a função
seed();
