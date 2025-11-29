import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const text = body.text;

        console.log(`\n📨 API 收到: "${text?.substring(0, 15)}..."`);

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // 🟢 使用 Hugging Face 官方免费推理 API (云端加速)
        // 这里的模型和你本地刚才测试成功的是同一个！
        const model = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
        const response = await fetch(
            `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`,
            {
                headers: {
                    // 如果你配置了环境变量，就用你的 Key；否则尝试匿名访问（可能会限流）
                    Authorization: `Bearer ${process.env.HF_TOKEN || ''}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: text,
                    options: { wait_for_model: true } // 确保模型加载好再返回
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("HF API Error:", error);
            throw new Error(`HuggingFace API Error: ${response.status}`);
        }

        const result = await response.json();
        
        // HF 返回的格式可能是嵌套数组，我们需要扁平化处理
        // 通常是 [0.1, 0.2, ...] 或者 [[0.1, 0.2, ...]]
        let embedding = result;
        if (Array.isArray(result) && Array.isArray(result[0])) {
            embedding = result[0];
        }

        console.log(`🧮 云端向量生成成功: [${embedding[0]?.toFixed(4)}, ...] 长度: ${embedding.length}`);

        return NextResponse.json({ embedding });

    } catch (error: any) {
        console.error("💥 接口失败:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}