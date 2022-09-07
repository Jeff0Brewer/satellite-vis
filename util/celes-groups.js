const noradGroups = {
    'Resource': [
        'weather',
        'noaa',
        'goes',
        'resource',
        'sarsat',
        'dmc',
        'tdrss',
        'argos',
        'planet',
        'spire',
    ],
    'Communications': [
        'geo',
        'intelsat',
        'ses',
        'iridium',
        'iridium-NEXT',
        'starlink',
        'oneweb',
        'orbcomm',
        'globalstar',
        'swarm',
        'amateur',
        'x-comm',
        'other-comm',
        'satnogs',
        'gorizont',
        'raduga',
        'molniya',
    ],
    'Navigation': [
        'gnss',
        'gps-ops',
        'glo-ops',
        'galileo',
        'beidou',
        'sbas',
        'nnss',
        'musson',
    ],
    'Scientific': [
        'science',
        'geodetic',
        'engineering',
        'education',
        'stations',
    ],
    'Debris': [
        '1982-092',
        '1999-025',
        'iridium-33-debris',
        'cosmos-2251-debris',
    ],
    'Misc': [
        'last-30-days',
        'visual',
        'active',
        'analyst',
        'military',
        'radar',
        'cubesat',
        'other'
    ]
}

const supplementalGroups = {
    'Resource': [
        'planet',
        'meteosat',
        'cpf'
    ],
    'Communications': [
        'starlink',
        'oneweb',
        'iridium',
        'intelsat',
        'ses',
        'telesat',
        'orbcomm'
    ],
    'Navigation': [
        'gps',
        'glonass'
    ],
    'Scientific': [
        'iss'
    ]
}

export {
    noradGroups,
    supplementalGroups
}
