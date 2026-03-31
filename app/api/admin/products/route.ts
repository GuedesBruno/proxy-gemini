import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(products, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar produtos:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar produtos', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, description, permissions } = body;

        if (!id || !name || !permissions || !Array.isArray(permissions)) {
            return NextResponse.json({ error: 'Campos obrigatórios: id, name, permissions (array).' }, { status: 400 });
        }

        const productRef = db.collection('products').doc(id);
        const productDoc = await productRef.get();

        if (productDoc.exists) {
            return NextResponse.json({ error: 'Um produto com este ID já existe.' }, { status: 409 });
        }

        await productRef.set({
            name,
            description: description || '',
            permissions,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ message: 'Produto criado com sucesso.', id }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar produto:', error);
        return NextResponse.json(
            { error: 'Falha ao criar produto.', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { products } = body; // Expects { products: [{ id: 'prod1', name: '...', permissions: [...] }, ...] }

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: 'Payload de produtos inválido. Array esperado.' }, { status: 400 });
        }

        const batch = db.batch();

        products.forEach((product: any) => {
            if (product.id) {
                const productRef = db.collection('products').doc(product.id);

                const updateData: any = {};
                if (product.name !== undefined) updateData.name = product.name;
                if (product.description !== undefined) updateData.description = product.description;
                if (product.permissions !== undefined) updateData.permissions = product.permissions;

                if (Object.keys(updateData).length > 0) {
                    batch.update(productRef, updateData);
                }
            }
        });

        await batch.commit();

        return NextResponse.json({ message: 'Produtos atualizados com sucesso.' }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao salvar produtos:', error);
        return NextResponse.json(
            { error: 'Falha ao salvar produtos.', details: error.message },
            { status: 500 }
        );
    }
}