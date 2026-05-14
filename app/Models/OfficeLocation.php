<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class OfficeLocation extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'radius_meters',
        'is_active',
        'work_start_time',
        'work_end_time',
        'late_tolerance_minutes',
        'work_days',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'late_tolerance_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * @return array<int, string>
     */
    public static function dayLabels(): array
    {
        return [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];
    }

    public function formatTime(string $field): string
    {
        $value = (string) $this->{$field};

        return $value === '' ? '' : substr($value, 0, 5);
    }

    /**
     * @return array<int>
     */
    public function workDaysArray(): array
    {
        $raw = (string) $this->work_days;

        return collect(explode(',', $raw))
            ->map(fn ($v) => (int) trim((string) $v))
            ->filter(fn (int $v) => $v >= 1 && $v <= 7)
            ->unique()
            ->values()
            ->all();
    }

    public function isWorkDay(?Carbon $at = null): bool
    {
        $at = $at ?: Carbon::now();

        return in_array($at->isoWeekday(), $this->workDaysArray(), true);
    }

    public function workStartCarbon(?Carbon $at = null): Carbon
    {
        $at = $at ?: Carbon::now();
        [$h, $m] = array_pad(explode(':', (string) $this->work_start_time), 2, '0');

        return $at->copy()->setTime((int) $h, (int) $m, 0);
    }

    public function workEndCarbon(?Carbon $at = null): Carbon
    {
        $at = $at ?: Carbon::now();
        [$h, $m] = array_pad(explode(':', (string) $this->work_end_time), 2, '0');

        return $at->copy()->setTime((int) $h, (int) $m, 0);
    }

    public function isLateAt(Carbon $at): bool
    {
        $deadline = $this->workStartCarbon($at)->addMinutes((int) $this->late_tolerance_minutes);

        return $at->greaterThan($deadline);
    }

    public function canCheckOutAt(Carbon $at): bool
    {
        return $at->greaterThanOrEqualTo($this->workEndCarbon($at));
    }

    public function workDayNames(): string
    {
        $labels = static::dayLabels();
        $days = collect($this->workDaysArray())
            ->map(fn (int $iso) => $labels[$iso] ?? null)
            ->filter()
            ->values()
            ->all();

        return implode(', ', $days);
    }

    public static function haversine(float $lat1, float $lng1, float $lat2, float $lng2): int
    {
        $earthRadius = 6371000.0;
        $latFrom = deg2rad($lat1);
        $latTo = deg2rad($lat2);
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2 + cos($latFrom) * cos($latTo) * sin($lngDelta / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round($earthRadius * $c);
    }
}
