import { useCallback, useState } from 'react';

export default function useUpdate() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
};
