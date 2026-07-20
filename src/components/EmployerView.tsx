import { EMPLOYER_GENERATORS, EMPLOYER_UPGRADES } from '../game/upgrades';
import { getUpgradeCost } from '../game/formulas';
import { useGameStore } from '../store/gameStore';
import { UpgradeButton } from './UpgradeButton';

export function EmployerView()
{
  const state = useGameStore((s) => s.state);
  const clickPostRole = useGameStore((s) => s.clickPostRole);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyGenerator = useGameStore((s) => s.buyGenerator);

  const { employer } = state;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 text-center">
        <button
          type="button"
          onClick={clickPostRole}
          className="btn-green font-pixel w-full rounded px-3 py-4 text-xs uppercase lg:py-5 lg:text-sm"
        >
          <i className="fa-solid fa-briefcase mr-1.5" />
          Post Role
        </button>
        <p className="mt-1.5 text-xs text-corp-muted">
          Open: {employer.openRoles}
        </p>
      </div>

      <div className="upgrade-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        <div>
          <h3 className="font-pixel mb-1 text-xs text-corp-muted lg:text-sm">Infrastructure</h3>
          <div className="space-y-1.5">
            {EMPLOYER_GENERATORS.map((gen) => {
              const level = employer.generatorLevels[gen.id] ?? 0;
              const cost = getUpgradeCost(gen.baseCost, gen.costMultiplier, level);
              const canAfford = employer.revenue >= cost;
              return (
                <UpgradeButton
                  key={gen.id}
                  item={gen}
                  currentLevel={level}
                  canAfford={canAfford}
                  onBuy={() => buyGenerator(gen.id)}
                  isGenerator
                />
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-pixel mb-1 text-xs text-corp-muted lg:text-sm">AI Tools</h3>
          <div className="space-y-1.5">
            {EMPLOYER_UPGRADES.map((upgrade) => {
              const level = employer.upgradeLevels[upgrade.id] ?? 0;
              const cost = getUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, level);
              const canAfford = employer.revenue >= cost;
              return (
                <UpgradeButton
                  key={upgrade.id}
                  item={upgrade}
                  currentLevel={level}
                  canAfford={canAfford}
                  onBuy={() => buyUpgrade(upgrade.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
