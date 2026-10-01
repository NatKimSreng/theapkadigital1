import type { ComponentType } from 'react';
import type { InvitationMedia } from '@/types';
import type { Motion } from '../animations';
import type { ResolvedInvitation } from '../resolve';
import type { HeroStyle } from '../templates';
import { EditorialCover } from './editorial';
import { FoilCover } from './foil';
import { GardenCover } from './garden';
import { KbachCover } from './kbach';
import { PrasatCover } from './prasat';
import { VelvetCover } from './velvet';

export type CoverProps = {
    data: ResolvedInvitation;
    media: InvitationMedia;
    guestName: string;
    motion: Motion;
    /** Absent in previews, where there is nothing below to scroll to. */
    onScrollDown?: () => void;
};

/**
 * Illustrated covers that replace the standard cover for their design.
 */
export const COVERS: Partial<Record<HeroStyle, ComponentType<CoverProps>>> = {
    garden: GardenCover,
    kbach: KbachCover,
    velvet: VelvetCover,
    editorial: EditorialCover,
    prasat: PrasatCover,
    foil: FoilCover,
};
