import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

// 这里的逻辑是单例模式，防止每次请求都重新加载模型（模型挺大的）
class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // 获取模型实例
        const extractor = await PipelineSingleton.getInstance();

        // 生成向量
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
        // 把 Tensor 转换成普通的数组
        const embedding = Array.from(output.data);

        return NextResponse.json({ embedding });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}