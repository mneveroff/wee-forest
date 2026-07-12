import { MapModeTypes } from '@/models/lens-config';

export enum DatasetTypes {
    NFI_AWI_Overlay = 'nao',
    NFI_Dataset = 'nfi',
    AWI_Dataset = 'awi',
}

export enum DatasetDataTypes {
    Overlay = 'o',
    Combined = 'c',
    Aggregate = 'a',
    Source = 's',
}

export enum ExtendedDatasetDataTypes {
    Overlay = 'type_overlay',
    Combined = 'type_combined',
    Aggregate = 'type_aggregate',
    Source = 'type_source',
}

export enum FeatureCharacteristic {
    Desirable = 'desirable',
    Undesirable = 'undesirable',
    Unclear = 'unclear'
}  

export type DatasetDataType = {
    id: DatasetDataTypes,
    label: string, 
    value: ExtendedDatasetDataTypes,
    order: DatasetDataTypeOrder,
    display: DatasetDataTypeDisplay,
    colorScheme: FeatureSetting[];
}

export enum DatasetDataTypeOrder {
    Declared,
    Alphanumeric,
    Value
}

export enum DatasetDataTypeDisplay {
    All,
    EnabledOnly,
    VisibleOnly,
    EnabledAndVisible
}

export type FeatureSetting = {
    source: string,
    label: string,
    value: string, 
    color: string,
    enabled: boolean,
    characteristic: FeatureCharacteristic,
    toggled: boolean,
}

// The names of colours are used to provide a consistent "perception" of desirability, not to always represent 1:1 they area they are assigned to
export enum LayerColors {
    UnnaturalGreen = '#052E16',
    ConiferGreen = '#166534',
    MixedGreen = '#15803D',
    BroadleavedGreen = '#16A34A',
    YoungGreen = `#22C55E`,
    LandGreen = `#4ADE80`,
    FelledCrimson = '#991B1B',
    FelledRed = '#B91C1C',
    BarrenRed = '#F87171',
    UnclearAmber= '#EA580C',
    UnclearYellow = '#F97316',
    UnclearBright = '#FB923C',
    WaterBlue = '#0891B2',
    OtherGray = '#64748B'
}

export type DatasetConfig = {
    id: DatasetTypes,
    label: string,
    datasetIdPrefix: string;
    datasetLayerId: string;
    startingYear: number;
    endingYear: number;
    modeAvailableIds: MapModeTypes[],
    dataTypes: DatasetDataType[];
};

export const DatasetConfigs = [
    {
        id: DatasetTypes.NFI_AWI_Overlay,
        label: 'National Forest Inventory with AWI Overlay',
        datasetIdPrefix: 'gb_nfi_awi_overlay_',
        datasetLayerId: 'gb_nfi_awi_overlay',
        startingYear: 2012,
        endingYear: 2022,
        modeAvailableIds: [ MapModeTypes.Timeline, MapModeTypes.Split, MapModeTypes.Swipe ],
        dataTypes: [
            { id: DatasetDataTypes.Overlay, label: 'Overlay', value: ExtendedDatasetDataTypes.Overlay, order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
                colorScheme: [
                    { source: 'AWI x NFI', label: 'Native Trees', value: 'Native Trees', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'NFI x AWI', label: 'Standing Timber', value: 'Non-Native Trees', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI x AWI', label: 'Barren & Felled', value: 'Other Felled Trees', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'AWI x NFI', label: 'Felled Native Trees', value: 'Felled Native Trees', color: LayerColors.FelledCrimson, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI x AWI', label: 'Other (land, pasture, urban, etc.)', value: 'Other (land, pasture, urban, etc.)', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: false },
                ]
            },
            { id: DatasetDataTypes.Combined, label: 'Combined', value: ExtendedDatasetDataTypes.Combined, order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
                colorScheme: [
                    { source: 'AWI', label: 'Native Trees', value: 'Native Trees', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: 'Semi-Native Trees', value: 'Semi-Native Trees', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: 'Other (land, pasture, etc.)', value: 'Other (land, pasture, unknown, etc.)', characteristic: FeatureCharacteristic.Unclear, color: LayerColors.LandGreen, enabled: true },
                    { source: 'NFI', label: 'Standing Timber', value: 'Trees', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Barren & Felled', value: 'Barren & Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI', label: 'Other (land, urban, etc.)', value: 'Other (land, urban, etc.)', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                ]
            },
            { id: DatasetDataTypes.Aggregate, label: 'Aggregate', value: ExtendedDatasetDataTypes.Aggregate, order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
                colorScheme: [
                    { source: 'AWI', label: 'Ancient or Native Woodland', value: 'Ancient & Mostly Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: 'Semi-Native Woodland', value: 'Semi-Natural Woodland', color: LayerColors.BroadleavedGreen, enabled: true },
                    { source: 'AWI', label: 'Naturalised Plantations', value: 'Plantation on Ancient Woodland Site', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: 'Other (unknown quality, pasture, etc.)', value: 'Other (unknown quality, pasture, etc.)', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Forestry Broadleaved', value: 'Broadleaved', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Forestry Conifer', value: 'Conifer', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Forestry Young trees', value: 'Young trees', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Forestry Mixed (conifer & broadleaved)', value: 'Mixed (conifer & broadleaved)', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Other Forestry (assumed & uncertain)', value: 'Other (assumed & uncertain)', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Barren & Felled', value: 'Barren & Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI', label: 'Other (land, urban, etc.)', value: 'Other (land, urban, etc.)', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                ]
            },
            { id: DatasetDataTypes.Source, label: 'Source', value: ExtendedDatasetDataTypes.Source, order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledAndVisible,
                colorScheme: [
                    { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient & Semi-Natural Woodland', value: 'Ancient & Semi-Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient Replanted Woodland', value: 'Ancient Replanted Woodland', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient Wood Pasture', value: 'Ancient Wood Pasture', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Native woodland', value: 'Native woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Nearly-native woodland', value: 'Nearly-native woodland', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 PAWS', value: 'PAWS', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Open land habitat', value: 'Open land habitat', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear,enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Ancient Semi Natural Woodland', value: 'Ancient Semi Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Plantation on Ancient Woodland Site', value: 'Plantation on Ancient Woodland Site', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Restored Ancient Woodland Site', value: 'Restored Ancient Woodland Site', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Restored Ancient Semi Natural Woodland', value: 'Restored Ancient Semi Natural Woodland', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Ancient Woodland Site of Unknown Category', value: 'Ancient Woodland Site of Unknown Category', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
                    { source: 'NFI', label: 'Assumed woodland', value: 'Assumed woodland', color: LayerColors.UnclearBright, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Agriculture land', value: 'Agriculture land', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Bare area', value: 'Bare area', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
                    { source: 'NFI', label: 'Broadleaved', value: 'Broadleaved', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Cloud \\ shadow', value: 'Cloud \\ shadow', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Conifer', value: 'Conifer', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Coppice', value: 'Coppice', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
                    { source: 'NFI', label: 'Coppice with standards', value: 'Coppice with standards', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI', label: 'Felled', value: 'Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
                    { source: 'NFI', label: 'Failed', value: 'Failed', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Grassland', value: 'Grassland', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Ground prep', value: 'Ground prep', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI', label: 'Low density', value: 'Low density', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Mixed mainly broadleaved', value: 'Mixed mainly broadleaved', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Mixed mainly conifer', value: 'Mixed mainly conifer', color: LayerColors.UnclearAmber, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Open water', value: 'Open water', color: LayerColors.WaterBlue, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Other vegetation', value: 'Other vegetation', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Powerline', value: 'Powerline', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Quarry', value: 'Quarry', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'River', value: 'River', color: LayerColors.WaterBlue, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Road', value: 'Road', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Shrub', value: 'Shrub', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Uncertain', value: 'Uncertain', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Urban', value: 'Urban', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
                    { source: 'NFI', label: 'Windblow', value: 'Windblow', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
                    { source: 'NFI', label: 'Windfarm', value: 'Windfarm', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                    { source: 'NFI', label: 'Young trees', value: 'Young trees', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
                ]
            }
        ],
    } as DatasetConfig,
    // {
    //     id: DatasetTypes.NFI_Dataset,
    //     label: 'National Forest Inventory',
    //     datasetIdPrefix: 'gb_nfi_dataset_',
    //     datasetLayerId: 'gb_nfi_dataset',
    //     startingYear: 2012,
    //     endingYear: 2022,
    //     modeAvailableIds: [ MapModeTypes.Timeline, MapModeTypes.Split, MapModeTypes.Swipe ],
    //     dataTypes: [
    //         { id: DatasetDataTypes.Combined, label: 'Combined', value: 'type_combined', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
    //             colorScheme: [
    //                 { source: 'NFI', label: 'Standing Trees', value: 'Trees', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Barren & Felled', value: 'Barren & Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
    //                 { source: 'NFI', label: 'Other (land, pasture, urban, etc.)', value: 'Other (land, pasture, urban, etc.)', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //             ]
    //         },
    //         { id: DatasetDataTypes.Aggregate, label: 'Aggregate', value: 'type_aggregate', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
    //             colorScheme: [
    //                 { source: 'NFI', label: 'Broadleaved', value: 'Broadleaved', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Conifer', value: 'Conifer', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Young trees', value: 'Young trees', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Mixed (conifer & broadleaved)', value: 'Mixed (conifer & broadleaved)', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Other (assumed & uncertain)', value: 'Other (assumed & uncertain)', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Barren & Felled', value: 'Barren & Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
    //                 { source: 'NFI', label: 'Other (land, urban, etc.)', value: 'Other (land, urban, etc.)', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //             ]
    //         },
    //         { id: DatasetDataTypes.Source, label: 'Source', value: 'type_source', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledAndVisible,
    //             colorScheme: [
    //                 { source: 'NFI', label: 'Assumed woodland', value: 'Assumed woodland', color: LayerColors.UnclearBright, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Agriculture land', value: 'Agriculture land', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Bare area', value: 'Bare area', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
    //                 { source: 'NFI', label: 'Broadleaved', value: 'Broadleaved', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Cloud \\ shadow', value: 'Cloud \\ shadow', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Conifer', value: 'Conifer', color: LayerColors.UnnaturalGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Coppice', value: 'Coppice', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
    //                 { source: 'NFI', label: 'Coppice with standards', value: 'Coppice with standards', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
    //                 { source: 'NFI', label: 'Felled', value: 'Felled', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },   
    //                 { source: 'NFI', label: 'Failed', value: 'Failed', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Grassland', value: 'Grassland', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Ground prep', value: 'Ground prep', color: LayerColors.BarrenRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
    //                 { source: 'NFI', label: 'Low density', value: 'Low density', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Mixed mainly broadleaved', value: 'Mixed mainly broadleaved', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Mixed mainly conifer', value: 'Mixed mainly conifer', color: LayerColors.UnclearAmber, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Open water', value: 'Open water', color: LayerColors.WaterBlue, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Other vegetation', value: 'Other vegetation', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Powerline', value: 'Powerline', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Quarry', value: 'Quarry', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'River', value: 'River', color: LayerColors.WaterBlue, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Road', value: 'Road', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Shrub', value: 'Shrub', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Uncertain', value: 'Uncertain', color: LayerColors.UnclearYellow, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Urban', value: 'Urban', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },   
    //                 { source: 'NFI', label: 'Windblow', value: 'Windblow', color: LayerColors.FelledRed, characteristic: FeatureCharacteristic.Undesirable, enabled: true },
    //                 { source: 'NFI', label: 'Windfarm', value: 'Windfarm', color: LayerColors.OtherGray, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'NFI', label: 'Young trees', value: 'Young trees', color: LayerColors.YoungGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //             ]
    //         }
    //     ],
    // } as DatasetConfig,
    // {
    //     id: DatasetTypes.AWI_Dataset,
    //     label: 'Ancient Woodland Inventory & NWSS',
    //     datasetLayerId: 'gb_awi_dataset',
    //     modeAvailableIds: [ MapModeTypes.Static ],
    //     dataTypes: [
    //         { id: DatasetDataTypes.Combined, label: 'Combined', value: 'type_combined', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
    //             colorScheme: [
    //                 { source: 'AWI', label: 'Native Trees', value: 'Native Trees', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: 'Semi-Native Trees', value: 'Semi-Native Trees', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: 'Other (land, pasture, etc.)', value: 'Other (land, pasture, unknown, etc.)', characteristic: FeatureCharacteristic.Unclear, color: LayerColors.LandGreen, enabled: true },
    //             ]
    //         },
    //         { id: DatasetDataTypes.Aggregate, label: 'Aggregate', value: 'type_aggregate', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledOnly,
    //             colorScheme: [
    //                 { source: 'AWI', label: 'Ancient or Native Woodland', value: 'Ancient & Mostly Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: 'Semi-Native Woodland', value: 'Semi-Natural Woodland', color: LayerColors.BroadleavedGreen, enabled: true },
    //                 { source: 'AWI', label: 'Naturalised Plantations', value: 'Plantation on Ancient Woodland Site', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: 'Other (unknown quality, pasture, etc.)', value: 'Other (unknown quality, pasture, etc.)', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //             ]
    //         },
    //         { id: DatasetDataTypes.Source, label: 'Source', value: 'type_source', order: DatasetDataTypeOrder.Declared, display: DatasetDataTypeDisplay.EnabledAndVisible,
    //             colorScheme: [
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient & Semi-Natural Woodland', value: 'Ancient & Semi-Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient Replanted Woodland', value: 'Ancient Replanted Woodland', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Ancient Wood Pasture', value: 'Ancient Wood Pasture', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Native woodland', value: 'Native woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Nearly-native woodland', value: 'Nearly-native woodland', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 PAWS', value: 'PAWS', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Open land habitat', value: 'Open land habitat', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Unclear,enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Ancient Semi Natural Woodland', value: 'Ancient Semi Natural Woodland', color: LayerColors.BroadleavedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Plantation on Ancient Woodland Site', value: 'Plantation on Ancient Woodland Site', color: LayerColors.ConiferGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Restored Ancient Woodland Site', value: 'Restored Ancient Woodland Site', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Restored Ancient Semi Natural Woodland', value: 'Restored Ancient Semi Natural Woodland', color: LayerColors.MixedGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //                 { source: 'AWI', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Ancient Woodland Site of Unknown Category', value: 'Ancient Woodland Site of Unknown Category', color: LayerColors.LandGreen, characteristic: FeatureCharacteristic.Desirable, enabled: true },
    //             ]
    //         }
    //     ],
    // } as DatasetConfig,
];