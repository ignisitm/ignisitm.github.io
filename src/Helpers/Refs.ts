import { useRef } from "react";

export const useRefer = (arg: any = null) => {
	const { current: val } = useRef(arg);
	return val;
};
