using System.ComponentModel.DataAnnotations;

namespace MediPredict.Data.ViewModels
{
    public class SymptomInputViewModel
    {
        // All 132 symptoms required by the ML model (in exact order as per MODEL_DOCUMENTATION.md)
        
        public bool Itching { get; set; } // 0
        public bool SkinRash { get; set; } // 1
        public bool NodalSkinEruptions { get; set; } // 2
        public bool ContinuousSneezing { get; set; } // 3
        public bool Shivering { get; set; } // 4
        public bool Chills { get; set; } // 5
        public bool JointPain { get; set; } // 6
        public bool StomachPain { get; set; } // 7
        public bool Acidity { get; set; } // 8
        public bool UlcersOnTongue { get; set; } // 9
        public bool MuscleWasting { get; set; } // 10
        public bool Vomiting { get; set; } // 11
        public bool BurningMicturition { get; set; } // 12
        public bool SpottingUrination { get; set; } // 13
        public bool Fatigue { get; set; } // 14
        public bool WeightGain { get; set; } // 15
        public bool Anxiety { get; set; } // 16
        public bool ColdHandsAndFeets { get; set; } // 17
        public bool MoodSwings { get; set; } // 18
        public bool WeightLoss { get; set; } // 19
        public bool Restlessness { get; set; } // 20
        public bool Lethargy { get; set; } // 21
        public bool PatchesInThroat { get; set; } // 22
        public bool IrregularSugarLevel { get; set; } // 23
        public bool Cough { get; set; } // 24
        public bool HighFever { get; set; } // 25
        public bool SunkenEyes { get; set; } // 26
        public bool Breathlessness { get; set; } // 27
        public bool Sweating { get; set; } // 28
        public bool Dehydration { get; set; } // 29
        public bool Indigestion { get; set; } // 30
        public bool Headache { get; set; } // 31
        public bool YellowishSkin { get; set; } // 32
        public bool DarkUrine { get; set; } // 33
        public bool Nausea { get; set; } // 34
        public bool LossOfAppetite { get; set; } // 35
        public bool PainBehindTheEyes { get; set; } // 36
        public bool BackPain { get; set; } // 37
        public bool Constipation { get; set; } // 38
        public bool AbdominalPain { get; set; } // 39
        public bool Diarrhoea { get; set; } // 40
        public bool MildFever { get; set; } // 41
        public bool YellowUrine { get; set; } // 42
        public bool YellowingOfEyes { get; set; } // 43
        public bool AcuteLiverFailure { get; set; } // 44
        public bool FluidOverload { get; set; } // 45
        public bool SwellingOfStomach { get; set; } // 46
        public bool SwelledLymphNodes { get; set; } // 47
        public bool Malaise { get; set; } // 48
        public bool BlurredAndDistortedVision { get; set; } // 49
        public bool Phlegm { get; set; } // 50
        public bool ThroatIrritation { get; set; } // 51
        public bool RednessOfEyes { get; set; } // 52
        public bool SinusPressure { get; set; } // 53
        public bool RunnyNose { get; set; } // 54
        public bool Congestion { get; set; } // 55
        public bool ChestPain { get; set; } // 56
        public bool WeaknessInLimbs { get; set; } // 57
        public bool FastHeartRate { get; set; } // 58
        public bool PainDuringBowelMovements { get; set; } // 59
        public bool PainInAnalRegion { get; set; } // 60
        public bool BloodyStool { get; set; } // 61
        public bool IrritationInAnus { get; set; } // 62
        public bool NeckPain { get; set; } // 63
        public bool Dizziness { get; set; } // 64
        public bool Cramps { get; set; } // 65
        public bool Bruising { get; set; } // 66
        public bool Obesity { get; set; } // 67
        public bool SwollenLegs { get; set; } // 68
        public bool SwollenBloodVessels { get; set; } // 69
        public bool PuffyFaceAndEyes { get; set; } // 70
        public bool EnlargedThyroid { get; set; } // 71
        public bool BrittleNails { get; set; } // 72
        public bool SwollenExtremeties { get; set; } // 73
        public bool ExcessiveHunger { get; set; } // 74
        public bool ExtraMaritalContacts { get; set; } // 75
        public bool DryingAndTinglingLips { get; set; } // 76
        public bool SlurredSpeech { get; set; } // 77
        public bool KneePain { get; set; } // 78
        public bool HipJointPain { get; set; } // 79
        public bool MuscleWeakness { get; set; } // 80
        public bool StiffNeck { get; set; } // 81
        public bool SwellingJoints { get; set; } // 82
        public bool MovementStiffness { get; set; } // 83
        public bool SpinningMovements { get; set; } // 84
        public bool LossOfBalance { get; set; } // 85
        public bool Unsteadiness { get; set; } // 86
        public bool WeaknessOfOneBodySide { get; set; } // 87
        public bool LossOfSmell { get; set; } // 88
        public bool BladderDiscomfort { get; set; } // 89
        public bool FoulSmellOfUrine { get; set; } // 90
        public bool ContinuousFeelOfUrine { get; set; } // 91
        public bool PassageOfGases { get; set; } // 92
        public bool InternalItching { get; set; } // 93
        public bool ToxicLookTyphos { get; set; } // 94
        public bool Depression { get; set; } // 95
        public bool Irritability { get; set; } // 96
        public bool MusclePain { get; set; } // 97
        public bool AlteredSensorium { get; set; } // 98
        public bool RedSpotsOverBody { get; set; } // 99
        public bool BellyPain { get; set; } // 100
        public bool AbnormalMenstruation { get; set; } // 101
        public bool DischromicPatches { get; set; } // 102
        public bool WateringFromEyes { get; set; } // 103
        public bool IncreasedAppetite { get; set; } // 104
        public bool Polyuria { get; set; } // 105
        public bool FamilyHistory { get; set; } // 106
        public bool MucoidSputum { get; set; } // 107
        public bool RustySputum { get; set; } // 108
        public bool LackOfConcentration { get; set; } // 109
        public bool VisualDisturbances { get; set; } // 110
        public bool ReceivingBloodTransfusion { get; set; } // 111
        public bool ReceivingUnsterileInjections { get; set; } // 112
        public bool Coma { get; set; } // 113
        public bool StomachBleeding { get; set; } // 114
        public bool DistentionOfAbdomen { get; set; } // 115
        public bool HistoryOfAlcoholConsumption { get; set; } // 116
        public bool FluidOverload2 { get; set; } // 117 (duplicate in original list)
        public bool BloodInSputum { get; set; } // 118
        public bool ProminentVeinsOnCalf { get; set; } // 119
        public bool Palpitations { get; set; } // 120
        public bool PainfulWalking { get; set; } // 121
        public bool PusFilledPimples { get; set; } // 122
        public bool Blackheads { get; set; } // 123
        public bool Scurring { get; set; } // 124
        public bool SkinPeeling { get; set; } // 125
        public bool SilverLikeDusting { get; set; } // 126
        public bool SmallDentsInNails { get; set; } // 127
        public bool InflammatoryNails { get; set; } // 128
        public bool Blister { get; set; } // 129
        public bool RedSoreAroundNose { get; set; } // 130
        public bool YellowCrustOoze { get; set; } // 131

        [StringLength(500, ErrorMessage = "Additional notes cannot exceed 500 characters")]
        [Display(Name = "Additional Notes (Optional)")]
        public string? AdditionalNotes { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Helper method to convert to list of symptom names for ML service
        public List<string> GetSymptomNamesForML()
        {
            var symptoms = new List<string>();
            
            if (Itching) symptoms.Add("itching");
            if (SkinRash) symptoms.Add("skin_rash");
            if (NodalSkinEruptions) symptoms.Add("nodal_skin_eruptions");
            if (ContinuousSneezing) symptoms.Add("continuous_sneezing");
            if (Shivering) symptoms.Add("shivering");
            if (Chills) symptoms.Add("chills");
            if (JointPain) symptoms.Add("joint_pain");
            if (StomachPain) symptoms.Add("stomach_pain");
            if (Acidity) symptoms.Add("acidity");
            if (UlcersOnTongue) symptoms.Add("ulcers_on_tongue");
            if (MuscleWasting) symptoms.Add("muscle_wasting");
            if (Vomiting) symptoms.Add("vomiting");
            if (BurningMicturition) symptoms.Add("burning_micturition");
            if (SpottingUrination) symptoms.Add("spotting_ urination");
            if (Fatigue) symptoms.Add("fatigue");
            if (WeightGain) symptoms.Add("weight_gain");
            if (Anxiety) symptoms.Add("anxiety");
            if (ColdHandsAndFeets) symptoms.Add("cold_hands_and_feets");
            if (MoodSwings) symptoms.Add("mood_swings");
            if (WeightLoss) symptoms.Add("weight_loss");
            if (Restlessness) symptoms.Add("restlessness");
            if (Lethargy) symptoms.Add("lethargy");
            if (PatchesInThroat) symptoms.Add("patches_in_throat");
            if (IrregularSugarLevel) symptoms.Add("irregular_sugar_level");
            if (Cough) symptoms.Add("cough");
            if (HighFever) symptoms.Add("high_fever");
            if (SunkenEyes) symptoms.Add("sunken_eyes");
            if (Breathlessness) symptoms.Add("breathlessness");
            if (Sweating) symptoms.Add("sweating");
            if (Dehydration) symptoms.Add("dehydration");
            if (Indigestion) symptoms.Add("indigestion");
            if (Headache) symptoms.Add("headache");
            if (YellowishSkin) symptoms.Add("yellowish_skin");
            if (DarkUrine) symptoms.Add("dark_urine");
            if (Nausea) symptoms.Add("nausea");
            if (LossOfAppetite) symptoms.Add("loss_of_appetite");
            if (PainBehindTheEyes) symptoms.Add("pain_behind_the_eyes");
            if (BackPain) symptoms.Add("back_pain");
            if (Constipation) symptoms.Add("constipation");
            if (AbdominalPain) symptoms.Add("abdominal_pain");
            if (Diarrhoea) symptoms.Add("diarrhoea");
            if (MildFever) symptoms.Add("mild_fever");
            if (YellowUrine) symptoms.Add("yellow_urine");
            if (YellowingOfEyes) symptoms.Add("yellowing_of_eyes");
            if (AcuteLiverFailure) symptoms.Add("acute_liver_failure");
            if (FluidOverload) symptoms.Add("fluid_overload");
            if (SwellingOfStomach) symptoms.Add("swelling_of_stomach");
            if (SwelledLymphNodes) symptoms.Add("swelled_lymph_nodes");
            if (Malaise) symptoms.Add("malaise");
            if (BlurredAndDistortedVision) symptoms.Add("blurred_and_distorted_vision");
            if (Phlegm) symptoms.Add("phlegm");
            if (ThroatIrritation) symptoms.Add("throat_irritation");
            if (RednessOfEyes) symptoms.Add("redness_of_eyes");
            if (SinusPressure) symptoms.Add("sinus_pressure");
            if (RunnyNose) symptoms.Add("runny_nose");
            if (Congestion) symptoms.Add("congestion");
            if (ChestPain) symptoms.Add("chest_pain");
            if (WeaknessInLimbs) symptoms.Add("weakness_in_limbs");
            if (FastHeartRate) symptoms.Add("fast_heart_rate");
            if (PainDuringBowelMovements) symptoms.Add("pain_during_bowel_movements");
            if (PainInAnalRegion) symptoms.Add("pain_in_anal_region");
            if (BloodyStool) symptoms.Add("bloody_stool");
            if (IrritationInAnus) symptoms.Add("irritation_in_anus");
            if (NeckPain) symptoms.Add("neck_pain");
            if (Dizziness) symptoms.Add("dizziness");
            if (Cramps) symptoms.Add("cramps");
            if (Bruising) symptoms.Add("bruising");
            if (Obesity) symptoms.Add("obesity");
            if (SwollenLegs) symptoms.Add("swollen_legs");
            if (SwollenBloodVessels) symptoms.Add("swollen_blood_vessels");
            if (PuffyFaceAndEyes) symptoms.Add("puffy_face_and_eyes");
            if (EnlargedThyroid) symptoms.Add("enlarged_thyroid");
            if (BrittleNails) symptoms.Add("brittle_nails");
            if (SwollenExtremeties) symptoms.Add("swollen_extremeties");
            if (ExcessiveHunger) symptoms.Add("excessive_hunger");
            if (ExtraMaritalContacts) symptoms.Add("extra_marital_contacts");
            if (DryingAndTinglingLips) symptoms.Add("drying_and_tingling_lips");
            if (SlurredSpeech) symptoms.Add("slurred_speech");
            if (KneePain) symptoms.Add("knee_pain");
            if (HipJointPain) symptoms.Add("hip_joint_pain");
            if (MuscleWeakness) symptoms.Add("muscle_weakness");
            if (StiffNeck) symptoms.Add("stiff_neck");
            if (SwellingJoints) symptoms.Add("swelling_joints");
            if (MovementStiffness) symptoms.Add("movement_stiffness");
            if (SpinningMovements) symptoms.Add("spinning_movements");
            if (LossOfBalance) symptoms.Add("loss_of_balance");
            if (Unsteadiness) symptoms.Add("unsteadiness");
            if (WeaknessOfOneBodySide) symptoms.Add("weakness_of_one_body_side");
            if (LossOfSmell) symptoms.Add("loss_of_smell");
            if (BladderDiscomfort) symptoms.Add("bladder_discomfort");
            if (FoulSmellOfUrine) symptoms.Add("foul_smell_of urine");
            if (ContinuousFeelOfUrine) symptoms.Add("continuous_feel_of_urine");
            if (PassageOfGases) symptoms.Add("passage_of_gases");
            if (InternalItching) symptoms.Add("internal_itching");
            if (ToxicLookTyphos) symptoms.Add("toxic_look_(typhos)");
            if (Depression) symptoms.Add("depression");
            if (Irritability) symptoms.Add("irritability");
            if (MusclePain) symptoms.Add("muscle_pain");
            if (AlteredSensorium) symptoms.Add("altered_sensorium");
            if (RedSpotsOverBody) symptoms.Add("red_spots_over_body");
            if (BellyPain) symptoms.Add("belly_pain");
            if (AbnormalMenstruation) symptoms.Add("abnormal_menstruation");
            if (DischromicPatches) symptoms.Add("dischromic _patches");
            if (WateringFromEyes) symptoms.Add("watering_from_eyes");
            if (IncreasedAppetite) symptoms.Add("increased_appetite");
            if (Polyuria) symptoms.Add("polyuria");
            if (FamilyHistory) symptoms.Add("family_history");
            if (MucoidSputum) symptoms.Add("mucoid_sputum");
            if (RustySputum) symptoms.Add("rusty_sputum");
            if (LackOfConcentration) symptoms.Add("lack_of_concentration");
            if (VisualDisturbances) symptoms.Add("visual_disturbances");
            if (ReceivingBloodTransfusion) symptoms.Add("receiving_blood_transfusion");
            if (ReceivingUnsterileInjections) symptoms.Add("receiving_unsterile_injections");
            if (Coma) symptoms.Add("coma");
            if (StomachBleeding) symptoms.Add("stomach_bleeding");
            if (DistentionOfAbdomen) symptoms.Add("distention_of_abdomen");
            if (HistoryOfAlcoholConsumption) symptoms.Add("history_of_alcohol_consumption");
            if (FluidOverload2) symptoms.Add("fluid_overload");
            if (BloodInSputum) symptoms.Add("blood_in_sputum");
            if (ProminentVeinsOnCalf) symptoms.Add("prominent_veins_on_calf");
            if (Palpitations) symptoms.Add("palpitations");
            if (PainfulWalking) symptoms.Add("painful_walking");
            if (PusFilledPimples) symptoms.Add("pus_filled_pimples");
            if (Blackheads) symptoms.Add("blackheads");
            if (Scurring) symptoms.Add("scurring");
            if (SkinPeeling) symptoms.Add("skin_peeling");
            if (SilverLikeDusting) symptoms.Add("silver_like_dusting");
            if (SmallDentsInNails) symptoms.Add("small_dents_in_nails");
            if (InflammatoryNails) symptoms.Add("inflammatory_nails");
            if (Blister) symptoms.Add("blister");
            if (RedSoreAroundNose) symptoms.Add("red_sore_around_nose");
            if (YellowCrustOoze) symptoms.Add("yellow_crust_ooze");
            
            return symptoms;
        }

        // Helper method to get a summary of symptoms
        public string GetSymptomSummary()
        {
            var symptoms = GetSymptomNamesForML();
            return symptoms.Count > 0 ? string.Join(", ", symptoms) : "No symptoms selected";
        }
    }
}
