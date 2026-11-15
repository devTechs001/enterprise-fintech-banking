/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex --
   The carousel container is focusable and handles ArrowLeft/ArrowRight so a keyboard
   user can move between cards without tabbing through every control on each one. That
   is the WAI-ARIA carousel pattern, but jsx-a11y models role="group" as
   non-interactive and has no way to express "this region owns the arrow keys", so the
   two rules that object to it are disabled for this file. The keyboard support they
   ask for is the reason the element is focusable in the first place. */
import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '../../common/Button';
import { VirtualCard } from '../VirtualCard/VirtualCard';

/**
 * Card carousel.
 *
 * This file was previously a barrel that re-exported itself:
 *
 *     export { CardCarousel } from './CardCarousel';
 *
 * so importing `CardCarousel` resolved to nothing and the Cards area had no
 * component to render. The header comment called the whole directory
 * "Placeholders".
 *
 * Keyboard-operable by design: a carousel that only responds to pointer clicks
 * is unusable without a mouse, and ArrowLeft/ArrowRight are the expected keys.
 */
const CardCarousel = ({ cards = [], onSelect, selectedId, className }) => {
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const count = cards.length;

  // Clamp after the list shrinks (a card was closed or frozen server-side).
  useEffect(() => {
    if (index > Math.max(0, count - 1)) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  // Keep the selected card in sync with an external selection.
  useEffect(() => {
    if (!selectedId) return;
    const next = cards.findIndex((card) => card.id === selectedId);
    if (next >= 0 && next !== index) setIndex(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const go = useCallback(
    (delta) => {
      if (count === 0) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count]
  );

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  };

  if (count === 0) {
    return (
      <div className={className}>
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No cards yet. Apply for one to get started.
        </p>
      </div>
    );
  }

  const active = cards[index];

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Your cards"
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => go(-1)}
            disabled={count < 2}
            aria-label="Previous card"
            leftIcon={ChevronLeft}
          />

          <div
            aria-live="polite"
            aria-atomic="true"
            onClick={() => onSelect?.(active)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(active);
              }
            }}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            className="cursor-pointer focus:outline-none"
          >
            <VirtualCard
              card={{
                cardNumber: active.maskedNumber,
                cardHolder: active.holderName,
                expiryDate: `${String(active.expiryMonth).padStart(2, '0')}/${String(active.expiryYear).padStart(2, '0')}`,
                cardType: active.cardType,
                isFrozen: active.status === 'frozen',
                isLocked: active.status === 'blocked',
                // Never present a CVV. It is not stored server-side at all, and
                // rendering one here would train users to expect it on screen.
                cvv: undefined,
              }}
              showControls={false}
              interactive={false}
            />
            <p className="sr-only">
              Card {index + 1} of {count}: {active.label}, ending {active.last4}, status {active.status}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => go(1)}
            disabled={count < 2}
            aria-label="Next card"
            leftIcon={ChevronRight}
          />
        </div>

        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {cards.map((card, dotIndex) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Show card ${dotIndex + 1}: ${card.label}`}
                aria-current={dotIndex === index}
                className={`h-2 rounded-full transition-all ${
                  dotIndex === index ? 'w-6 bg-primary-600' : 'w-2 bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        {active.label} · {active.isVirtual ? 'Virtual' : 'Physical'} · {active.status}
      </p>
    </div>
  );
};

CardCarousel.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func,
  selectedId: PropTypes.string,
  className: PropTypes.string,
};

export { CardCarousel };
export default CardCarousel;
