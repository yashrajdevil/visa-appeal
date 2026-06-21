import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export default function BlogArticleView() {
    const { slug } = useParams<{ slug: string }>();
    return <Navigate to="/blog" replace />;
}
