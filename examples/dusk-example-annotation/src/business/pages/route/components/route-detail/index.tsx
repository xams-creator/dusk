import React from 'react';
import { useParams } from '@xams-framework/dusk';

interface Params {
    id: string;
}

const RouteDetail: React.FC<any> = (props) => {
    const params = useParams<Params>();
    return <div>home detail {params.id}</div>;
};

RouteDetail.displayName = 'RouteDetail';
export default RouteDetail;