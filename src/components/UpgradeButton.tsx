import { getUpgradeCost } from '../game/formulas';
import type { GeneratorDefinition, UpgradeDefinition } from '../game/types';
import { getUpgradeIcon, InstantTooltip } from './InstantTooltip';

interface UpgradeButtonProps
{
  item: UpgradeDefinition | GeneratorDefinition;
  currentLevel: number;
  canAfford: boolean;
  onBuy: () => void;
  isGenerator?: boolean;
}

export function UpgradeButton({
  item,
  currentLevel,
  canAfford,
  onBuy,
  isGenerator = false,
}: UpgradeButtonProps)
{
  const maxed = currentLevel >= item.maxLevel;
  const cost = getUpgradeCost(item.baseCost, item.costMultiplier, currentLevel);
  const costLabel = item.costType === 'savings' ? 'Savings' : 'Revenue';
  const icon = getUpgradeIcon(item, isGenerator);

  return (
    <InstantTooltip text={item.description} icon={icon}>
      <button
        type="button"
        onClick={onBuy}
        disabled={maxed || !canAfford}
        className="w-full rounded border border-corp-border bg-corp-bg px-2.5 py-2 text-left transition hover:border-corp-green disabled:cursor-not-allowed disabled:opacity-50 lg:px-3 lg:py-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-xs leading-tight text-corp-text lg:text-sm">
            <i className={`${icon} mr-1.5 text-sm text-corp-muted lg:text-base`} aria-hidden="true" />
            {item.name}
            {isGenerator && <span className="ml-1 text-corp-muted">(Auto)</span>}
          </p>
          <div className="shrink-0 text-right text-xs leading-tight lg:text-sm">
            <p className="text-corp-amber">
              Lv {currentLevel}/{item.maxLevel}
            </p>
            {!maxed && (
              <p className="text-corp-muted">
                ${cost.toLocaleString()} {costLabel}
              </p>
            )}
            {maxed && <p className="text-corp-green">MAX</p>}
          </div>
        </div>
      </button>
    </InstantTooltip>
  );
}
