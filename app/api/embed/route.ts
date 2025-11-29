import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // 读取新的环境变量
    const token = process.env.SILICON_TOKEN;
    
    // 🔍 调试日志
    console.log("🔑 [Silicon] Token:", token ? "✅ 已读取" : "❌ 未读取");

    try {
        const body = await request.json();
        const text = body.text;

        if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 });

        console.log(`📨 [Silicon] 请求生成向量: "${text.substring(0, 10)}..."`);

        // 🟢 调用硅基流动 API (兼容 OpenAI 格式)
        const response = await fetch('https://api.siliconflow.cn/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "BAAI/bge-m3", //这是目前最强的中文开源Embedding模型
                input: text,
                encoding_format: "float"
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`SiliconCloud API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;

        console.log(`🧮 向量生成成功 (维度: ${embedding.length})`); // 应该是 1024

        return NextResponse.json({ embedding });

    } catch (error: any) {
        console.error("🚨 失败:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}