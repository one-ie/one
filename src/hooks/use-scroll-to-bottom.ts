"use client";

import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

interface ScrollOptions {
	threshold?: number;
	behavior?: ScrollBehavior;
	debounce?: number;
}

export function useScrollToBottom<T extends HTMLElement>(
	options: ScrollOptions = {}
): [RefObject<T>, boolean, () => void] {
	const {
		threshold = 100,
		behavior = "smooth",
		debounce = 50
	} = options;
	
	const containerRef = useRef<T>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const isUserScrolling = useRef(false);
	const isGrowing = useRef(false);
	const debounceTimeout = useRef<number | null>(null);

	const getViewport = useCallback((element: HTMLElement | null) => {
		return element?.closest("[data-radix-scroll-area-viewport]") as HTMLElement;
	}, []);

	const isAtBottom = useCallback((viewport: HTMLElement) => {
		const { scrollTop, scrollHeight, clientHeight } = viewport;
		// Use threshold to determine if we're "close enough" to the bottom
		return scrollHeight - scrollTop - clientHeight < threshold;
	}, [threshold]);

	const updateScrollState = useCallback(
		(viewport: HTMLElement) => {
			if (debounceTimeout.current) {
				window.clearTimeout(debounceTimeout.current);
			}

			debounceTimeout.current = window.setTimeout(() => {
				const { scrollHeight, clientHeight } = viewport;
				const hasScrollableContent = scrollHeight > clientHeight;
				const atBottom = isAtBottom(viewport);

				setShowScrollButton(hasScrollableContent && !atBottom);

				if (!isUserScrolling.current) {
					setShouldAutoScroll(atBottom);
				}
			}, debounce);
		},
		[isAtBottom, debounce],
	);

	useEffect(() => {
		const container = containerRef.current;
		const viewport = getViewport(container);

		if (!container || !viewport) {
			return;
		}

		updateScrollState(viewport);

		const handleScroll = () => {
			if (!isUserScrolling.current) {
				updateScrollState(viewport);
			}
		};

		const handleTouchStart = () => {
			isUserScrolling.current = true;
		};

		const handleTouchEnd = () => {
			isUserScrolling.current = false;
			updateScrollState(viewport);
		};

		const handleMouseDown = () => {
			isUserScrolling.current = true;
		};

		const handleMouseUp = () => {
			// Small delay to ensure it's a deliberate action
			setTimeout(() => {
				isUserScrolling.current = false;
				updateScrollState(viewport);
			}, 100);
		};

		let growthTimeout: number;
		const observer = new MutationObserver(() => {
			isGrowing.current = true;
			window.clearTimeout(growthTimeout);

			if (shouldAutoScroll && !isUserScrolling.current) {
				viewport.scrollTo({
					top: viewport.scrollHeight,
					behavior: behavior === "smooth" && isGrowing.current ? "smooth" : "instant",
				});
			}
			updateScrollState(viewport);

			growthTimeout = window.setTimeout(() => {
				isGrowing.current = false;
			}, 100);
		});

		viewport.addEventListener("scroll", handleScroll, { passive: true });
		viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
		viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
		viewport.addEventListener("mousedown", handleMouseDown, { passive: true });
		viewport.addEventListener("mouseup", handleMouseUp, { passive: true });

		observer.observe(container, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});

		return () => {
			if (debounceTimeout.current) {
				window.clearTimeout(debounceTimeout.current);
			}
			window.clearTimeout(growthTimeout);
			observer.disconnect();
			viewport.removeEventListener("scroll", handleScroll);
			viewport.removeEventListener("touchstart", handleTouchStart);
			viewport.removeEventListener("touchend", handleTouchEnd);
			viewport.removeEventListener("mousedown", handleMouseDown);
			viewport.removeEventListener("mouseup", handleMouseUp);
		};
	}, [getViewport, updateScrollState, shouldAutoScroll, behavior]);

	const scrollToBottom = () => {
		const viewport = getViewport(containerRef.current);
		if (!viewport) {
			return;
		}

		setShouldAutoScroll(true);
		viewport.scrollTo({
			top: viewport.scrollHeight,
			behavior: isGrowing.current ? "instant" : behavior,
		});
	};

	return [containerRef, showScrollButton, scrollToBottom];
}
