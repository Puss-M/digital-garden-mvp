import React from 'react';
import { MoreHorizontal, MessageCircle } from 'lucide-react';

const DUMMY_POSTS = [
  {
    id: 1,
    user: { name: "李明", role: "产品经理", avatar: "L" },
    time: "2小时前",
    title: "关于Q3用户增长的新路径思考",
    content: "我们应该重点关注存有用户的激活，结合新功能推出一系列运营活动...",
    tags: ["增长黑客", "UI优化"],
    comments: 5
  },
  {
    id: 2,
    user: { name: "李明", role: "产品经理", avatar: "L" },
    time: "2小时前",
    title: "关于Q3用户增长的新路径思考",
    content: "我们应该重点关注存有用户的激活，结合新功能推出一系列运营活动...",
    tags: ["增长黑客", "UI优化"],
    comments: 5
  },
  {
    id: 3,
    user: { name: "李明", role: "产品经理", avatar: "L" },
    time: "2小时前",
    title: "关于Q3用户增长的新路径思考",
    content: "我们应该重点关注存有用户的激活，结合新功能推出一系列运营活动...",
    tags: ["增长黑客", "UI优化"],
    comments: 5
  }
];

export const TeamSparkFeed: React.FC = () => {
  return (
    <div className="flex-1 py-6 px-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">灵感流</h2>

        <div className="space-y-4">
          {DUMMY_POSTS.map(post => (
             <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                         {post.user.avatar}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">{post.user.name}</span>
                            <span className="text-xs text-gray-500">({post.user.role})</span>
                         </div>
                         <span className="text-xs text-gray-400">{post.time}</span>
                      </div>
                   </div>
                   <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                   </button>
                </div>

                {/* Content */}
                <div className="mb-3">
                   <h3 className="font-bold text-gray-900 text-base mb-1.5">{post.title}</h3>
                   <p className="text-gray-600 text-sm leading-relaxed">
                      {post.content}
                   </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                   {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                         #{tag}
                      </span>
                   ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1 text-gray-400">
                   <MessageCircle className="w-4 h-4" />
                   <span className="text-sm">{post.comments} 条评论</span>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
