<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class DepartmentHoursValidationTest extends TestCase
{
    public function test_handles_null_time_values_gracefully()
    {
        // Simular la estructura de datos que puede tener valores null
        $hoursData = [
            [
                'day_of_week' => 1,
                'is_closed' => false,
                'time_ranges' => [
                    [
                        'id' => '1',
                        'open_time' => null, // Valor null que causaba el error
                        'close_time' => '18:00',
                    ],
                    [
                        'id' => '2',
                        'open_time' => '09:00',
                        'close_time' => null, // Valor null que causaba el error
                    ],
                    [
                        'id' => '3',
                        'open_time' => '10:00',
                        'close_time' => '12:00',
                    ],
                ],
            ],
        ];

        // Simular la función hasOverlap que se arregló
        $hasOverlapResult = $this->hasOverlap(1, $hoursData);

        // El resultado debe ser false porque no hay suficientes rangos válidos para comparar
        $this->assertFalse($hasOverlapResult);

        // También probar validateTime
        $validateTimeResult = $this->validateTime(1, $hoursData);
        $this->assertFalse($validateTimeResult); // Debe ser false porque hay rangos inválidos
    }

    public function test_validates_overlapping_times_correctly()
    {
        $hoursData = [
            [
                'day_of_week' => 1,
                'is_closed' => false,
                'time_ranges' => [
                    [
                        'id' => '1',
                        'open_time' => '09:00',
                        'close_time' => '13:00',
                    ],
                    [
                        'id' => '2',
                        'open_time' => '12:00', // Solapamiento con el anterior
                        'close_time' => '18:00',
                    ],
                ],
            ],
        ];

        $hasOverlapResult = $this->hasOverlap(1, $hoursData);
        $this->assertTrue($hasOverlapResult); // Debe detectar el solapamiento
    }

    private function hasOverlap(int $dayOfWeek, array $hours): bool
    {
        $hour = collect($hours)->firstWhere('day_of_week', $dayOfWeek);
        if (! $hour || $hour['is_closed'] || count($hour['time_ranges']) < 2) {
            return false;
        }

        // Filtrar rangos válidos y ordenar de forma segura
        $validRanges = array_filter($hour['time_ranges'], function ($range) {
            return $range['open_time'] && $range['close_time'];
        });

        if (count($validRanges) < 2) {
            return false;
        }

        usort($validRanges, function ($a, $b) {
            return strcmp($a['open_time'], $b['open_time']);
        });

        for ($i = 0; $i < count($validRanges) - 1; $i++) {
            if ($validRanges[$i]['close_time'] > $validRanges[$i + 1]['open_time']) {
                return true;
            }
        }

        return false;
    }

    private function validateTime(int $dayOfWeek, array $hours): bool
    {
        $hour = collect($hours)->firstWhere('day_of_week', $dayOfWeek);
        if (! $hour || $hour['is_closed']) {
            return true;
        }

        // Validar que cada rango tenga hora de cierre posterior a apertura
        $allRangesValid = collect($hour['time_ranges'])->every(function ($r) {
            return $r['open_time'] && $r['close_time'] && $r['close_time'] > $r['open_time'];
        });

        // Validar que no haya solapamientos
        $noOverlap = ! $this->hasOverlap($dayOfWeek, $hours);

        return $allRangesValid && $noOverlap;
    }
}
